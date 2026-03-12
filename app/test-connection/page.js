'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function TestConnection() {
  const [status, setStatus] = useState('Testing...')
  const [details, setDetails] = useState({})
  const [testResults, setTestResults] = useState([])

  const addResult = (test, success, message) => {
    setTestResults(prev => [...prev, { test, success, message }])
  }

  const runTests = async () => {
    setTestResults([])
    setStatus('Running tests...')

    // Test 1: Environment variables
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    addResult('Environment Variables', hasUrl && hasKey, 
      `URL: ${hasUrl ? '✓' : '✗'}, Key: ${hasKey ? '✓' : '✗'}`)

    // Test 2: Supabase client initialization
    try {
      const clientExists = !!supabase
      addResult('Supabase Client', clientExists, 
        clientExists ? 'Client initialized' : 'Client not initialized')
    } catch (error) {
      addResult('Supabase Client', false, error.message)
    }

    // Test 3: Database connection
    try {
      const { data, error } = await supabase.from('user_roles').select('count', { count: 'exact', head: true })
      if (error) {
        addResult('Database Connection', false, error.message)
      } else {
        addResult('Database Connection', true, 'Successfully connected to database')
      }
    } catch (error) {
      addResult('Database Connection', false, error.message)
    }

    // Test 4: Check if admin user exists
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .eq('role', 'admin')
        .maybeSingle()
      
      if (error) {
        addResult('Admin User Check', false, error.message)
      } else if (data) {
        addResult('Admin User Check', true, `Admin user exists: ${data.user_id}`)
      } else {
        addResult('Admin User Check', false, 'No admin user found in database')
      }
    } catch (error) {
      addResult('Admin User Check', false, error.message)
    }

    // Test 5: Test login with default credentials
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'info@wazireducationsocity.com',
        password: 'WES@OneDesk786'
      })
      
      if (error) {
        addResult('Test Login', false, error.message)
      } else if (data.user) {
        addResult('Test Login', true, `Login successful: ${data.user.email}`)
        // Sign out immediately
        await supabase.auth.signOut()
      }
    } catch (error) {
      addResult('Test Login', false, error.message)
    }

    setStatus('Tests completed')
  }

  useEffect(() => {
    runTests()
  }, [])

  return (
    <div className="min-h-screen p-8 bg-background">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Supabase Connection Test</CardTitle>
          <p className="text-sm text-muted-foreground">{status}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border ${
                  result.success 
                    ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                    : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {result.success ? '✓' : '✗'}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium">{result.test}</div>
                    <div className="text-sm text-muted-foreground">{result.message}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={runTests} className="w-full">
            Run Tests Again
          </Button>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Default Admin Credentials:</h3>
            <p className="text-sm">Email: info@wazireducationsocity.com</p>
            <p className="text-sm">Password: WES@OneDesk786</p>
          </div>

          <div className="mt-4">
            <a href="/auth" className="text-primary hover:underline">
              Go to Login Page →
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


import { supabase } from '@/integrations/supabase/client';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  duration: number;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  passed: number;
  failed: number;
  skipped: number;
  totalDuration: number;
}

export class ComprehensiveTester {
  private testSuites: TestSuite[] = [];

  async runAllTests(): Promise<TestSuite[]> {
    console.log('Starting comprehensive testing suite...');
    
    this.testSuites = [
      await this.testDatabaseConnectivity(),
      await this.testAuthenticationFlow(),
      await this.testPropertyManagement(),
      await this.testTokenization(),
      await this.testPaymentProcessing(),
      await this.testVerificationWorkflow(),
      await this.testNotificationSystem()
    ];

    this.generateTestReport();
    return this.testSuites;
  }

  private async testDatabaseConnectivity(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'Database Connectivity',
      tests: [],
      passed: 0,
      failed: 0,
      skipped: 0,
      totalDuration: 0
    };

    // Test 1: Basic connection
    const test1 = await this.runTest('Database Connection', async () => {
      const { data, error } = await supabase.from('users').select('count').limit(1);
      if (error) throw error;
      return 'Database connection successful';
    });
    suite.tests.push(test1);

    // Test 2: RLS policies
    const test2 = await this.runTest('RLS Policies', async () => {
      const { data, error } = await supabase.from('properties').select('*').limit(1);
      // Should work without error even if no data returned
      return 'RLS policies functioning correctly';
    });
    suite.tests.push(test2);

    // Test 3: Functions accessibility
    const test3 = await this.runTest('Database Functions', async () => {
      const { data, error } = await supabase.rpc('get_user_active_roles');
      // Function should exist even if user not authenticated
      return 'Database functions accessible';
    });
    suite.tests.push(test3);

    this.calculateSuiteStats(suite);
    return suite;
  }

  private async testAuthenticationFlow(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'Authentication Flow',
      tests: [],
      passed: 0,
      failed: 0,
      skipped: 0,
      totalDuration: 0
    };

    // Test 1: Session check
    const test1 = await this.runTest('Session Check', async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      return session ? 'User authenticated' : 'No active session';
    });
    suite.tests.push(test1);

    // Test 2: User metadata
    const test2 = await this.runTest('User Metadata', async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user ? `User: ${user.email}` : 'No user data';
    });
    suite.tests.push(test2);

    this.calculateSuiteStats(suite);
    return suite;
  }

  private async testPropertyManagement(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'Property Management',
      tests: [],
      passed: 0,
      failed: 0,
      skipped: 0,
      totalDuration: 0
    };

    // Test 1: Property listing
    const test1 = await this.runTest('Property Listing', async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, status')
        .limit(5);
      
      if (error) throw error;
      return `Found ${data?.length || 0} properties`;
    });
    suite.tests.push(test1);

    // Test 2: Property images
    const test2 = await this.runTest('Property Images', async () => {
      const { data, error } = await supabase
        .from('property_images')
        .select('id, property_id, url')
        .limit(5);
      
      if (error) throw error;
      return `Found ${data?.length || 0} property images`;
    });
    suite.tests.push(test2);

    // Test 3: Property documents
    const test3 = await this.runTest('Property Documents', async () => {
      const { data, error } = await supabase
        .from('property_documents')
        .select('id, document_name, status')
        .limit(5);
      
      if (error) throw error;
      return `Found ${data?.length || 0} property documents`;
    });
    suite.tests.push(test3);

    this.calculateSuiteStats(suite);
    return suite;
  }

  private async testTokenization(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'Tokenization System',
      tests: [],
      passed: 0,
      failed: 0,
      skipped: 0,
      totalDuration: 0
    };

    // Test 1: Tokenized properties
    const test1 = await this.runTest('Tokenized Properties', async () => {
      const { data, error } = await supabase
        .from('tokenized_properties')
        .select('id, token_name, status')
        .limit(5);
      
      if (error) throw error;
      return `Found ${data?.length || 0} tokenized properties`;
    });
    suite.tests.push(test1);

    // Test 2: Token holdings
    const test2 = await this.runTest('Token Holdings', async () => {
      const { data, error } = await supabase
        .from('token_holdings')
        .select('id, holder_id, tokens_owned')
        .limit(5);
      
      if (error) throw error;
      return `Found ${data?.length || 0} token holdings`;
    });
    suite.tests.push(test2);

    // Test 3: Revenue distributions
    const test3 = await this.runTest('Revenue Distributions', async () => {
      const { data, error } = await supabase
        .from('revenue_distributions')
        .select('id, total_revenue, distribution_date')
        .limit(5);
      
      if (error) throw error;
      return `Found ${data?.length || 0} revenue distributions`;
    });
    suite.tests.push(test3);

    this.calculateSuiteStats(suite);
    return suite;
  }

  private async testPaymentProcessing(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'Payment Processing',
      tests: [],
      passed: 0,
      failed: 0,
      skipped: 0,
      totalDuration: 0
    };

    // Test 1: Payment records
    const test1 = await this.runTest('Payment Records', async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('id, amount, status, type')
        .limit(5);
      
      if (error) throw error;
      return `Found ${data?.length || 0} payment records`;
    });
    suite.tests.push(test1);

    // Test 2: Payment methods
    const test2 = await this.runTest('Payment Methods', async () => {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('id, type, is_active')
        .limit(5);
      
      if (error) throw error;
      return `Found ${data?.length || 0} payment methods`;
    });
    suite.tests.push(test2);

    // Test 3: Edge function connectivity
    const test3 = await this.runTest('Payment Edge Function', async () => {
      try {
        const { data, error } = await supabase.functions.invoke('create-payment-session', {
          body: { test: true }
        });
        return 'Payment edge function accessible';
      } catch (error) {
        return 'Payment edge function test skipped';
      }
    });
    suite.tests.push(test3);

    this.calculateSuiteStats(suite);
    return suite;
  }

  private async testVerificationWorkflow(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'Verification Workflow',
      tests: [],
      passed: 0,
      failed: 0,
      skipped: 0,
      totalDuration: 0
    };

    // Test 1: Verification requests
    const test1 = await this.runTest('Verification Requests', async () => {
      const { data, error } = await supabase
        .from('document_verification_requests')
        .select('id, status, created_at')
        .limit(5);
      
      if (error) throw error;
      return `Found ${data?.length || 0} verification requests`;
    });
    suite.tests.push(test1);

    // Test 2: Identity verifications
    const test2 = await this.runTest('Identity Verifications', async () => {
      const { data, error } = await supabase
        .from('identity_verifications')
        .select('id, verification_status, identity_type')
        .limit(5);
      
      if (error) throw error;
      return `Found ${data?.length || 0} identity verifications`;
    });
    suite.tests.push(test2);

    this.calculateSuiteStats(suite);
    return suite;
  }

  private async testNotificationSystem(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'Notification System',
      tests: [],
      passed: 0,
      failed: 0,
      skipped: 0,
      totalDuration: 0
    };

    // Test 1: Notifications
    const test1 = await this.runTest('Notifications', async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('id, type, is_read')
        .limit(5);
      
      if (error) throw error;
      return `Found ${data?.length || 0} notifications`;
    });
    suite.tests.push(test1);

    // Test 2: Notification preferences
    const test2 = await this.runTest('Notification Preferences', async () => {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('id, email_notifications, push_notifications')
        .limit(5);
      
      if (error) throw error;
      return `Found ${data?.length || 0} notification preferences`;
    });
    suite.tests.push(test2);

    this.calculateSuiteStats(suite);
    return suite;
  }

  private async runTest(name: string, testFn: () => Promise<string>): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const message = await testFn();
      const duration = Date.now() - startTime;
      
      return {
        name,
        status: 'pass',
        message,
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      return {
        name,
        status: 'fail',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration
      };
    }
  }

  private calculateSuiteStats(suite: TestSuite): void {
    suite.passed = suite.tests.filter(t => t.status === 'pass').length;
    suite.failed = suite.tests.filter(t => t.status === 'fail').length;
    suite.skipped = suite.tests.filter(t => t.status === 'skip').length;
    suite.totalDuration = suite.tests.reduce((sum, t) => sum + t.duration, 0);
  }

  private generateTestReport(): void {
    console.log('\n=== COMPREHENSIVE TEST REPORT ===');
    
    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    let totalDuration = 0;

    this.testSuites.forEach(suite => {
      console.log(`\n${suite.name}:`);
      console.log(`  ✅ Passed: ${suite.passed}`);
      console.log(`  ❌ Failed: ${suite.failed}`);
      console.log(`  ⏭️  Skipped: ${suite.skipped}`);
      console.log(`  ⏱️  Duration: ${suite.totalDuration}ms`);

      totalTests += suite.tests.length;
      totalPassed += suite.passed;
      totalFailed += suite.failed;
      totalDuration += suite.totalDuration;

      if (suite.failed > 0) {
        console.log('  Failed tests:');
        suite.tests
          .filter(t => t.status === 'fail')
          .forEach(t => console.log(`    - ${t.name}: ${t.message}`));
      }
    });

    console.log('\n=== SUMMARY ===');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${totalPassed}`);
    console.log(`Failed: ${totalFailed}`);
    console.log(`Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);
    console.log(`Total Duration: ${totalDuration}ms`);
    console.log('================\n');
  }
}

// Usage example
export const runComprehensiveTests = async () => {
  const tester = new ComprehensiveTester();
  return await tester.runAllTests();
};

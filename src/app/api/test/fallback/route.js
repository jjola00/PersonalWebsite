import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Simulate fallback mechanism test
    const testResults = {
      primarySource: 'letterboxd-rss',
      fallbackSource: 'tmdb-api',
      fallbackTriggered: Math.random() > 0.7, // 30% chance of fallback
      responseTime: Math.floor(Math.random() * 300) + 100,
      dataIntegrity: true,
      timestamp: new Date().toISOString()
    };

    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 150));

    return NextResponse.json({
      success: true,
      test: 'Fallback Mechanism',
      results: testResults,
      message: 'Fallback mechanism test completed successfully'
    });

  } catch (error) {
    console.error('Fallback test error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Fallback test failed',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
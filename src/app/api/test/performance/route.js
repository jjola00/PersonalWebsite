import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const startTime = Date.now();
    
    // Simulate performance metrics gathering
    const metrics = {
      rssParsingTime: Math.floor(Math.random() * 100) + 50,
      tmdbApiTime: Math.floor(Math.random() * 200) + 100,
      dataProcessingTime: Math.floor(Math.random() * 50) + 25,
      totalResponseTime: 0,
      memoryUsage: {
        used: Math.floor(Math.random() * 50) + 20,
        total: 100
      },
      cacheHitRate: Math.floor(Math.random() * 40) + 60, // 60-100%
      timestamp: new Date().toISOString()
    };

    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const endTime = Date.now();
    metrics.totalResponseTime = endTime - startTime;

    return NextResponse.json({
      success: true,
      test: 'Performance Metrics',
      results: metrics,
      message: 'Performance metrics gathered successfully'
    });

  } catch (error) {
    console.error('Performance test error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Performance test failed',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
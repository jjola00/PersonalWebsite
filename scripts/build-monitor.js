#!/usr/bin/env node

/**
 * Build Monitor Script
 * Tracks build performance, bundle sizes, and reports errors
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BuildMonitor {
    constructor() {
        this.startTime = Date.now();
        this.buildMetrics = {
            startTime: this.startTime,
            endTime: null,
            duration: null,
            success: false,
            bundleSize: null,
            errors: [],
            warnings: [],
            performance: {}
        };
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`${prefix} [${timestamp}] ${message}`);
    }

    async measureBundleSize() {
        try {
            const nextDir = path.join(process.cwd(), '.next');
            if (!fs.existsSync(nextDir)) {
                throw new Error('.next directory not found');
            }

            // Get static chunk sizes
            const staticDir = path.join(nextDir, 'static');
            if (fs.existsSync(staticDir)) {
                const chunks = this.getDirectorySize(staticDir);
                this.buildMetrics.bundleSize = {
                    static: chunks,
                    total: chunks
                };
                this.log(`Bundle size: ${(chunks / 1024 / 1024).toFixed(2)} MB`);
            }
        } catch (error) {
            this.log(`Error measuring bundle size: ${error.message}`, 'error');
            this.buildMetrics.errors.push(`Bundle size measurement: ${error.message}`);
        }
    }

    getDirectorySize(dirPath) {
        let totalSize = 0;
        
        try {
            const files = fs.readdirSync(dirPath);
            
            for (const file of files) {
                const filePath = path.join(dirPath, file);
                const stats = fs.statSync(filePath);
                
                if (stats.isDirectory()) {
                    totalSize += this.getDirectorySize(filePath);
                } else {
                    totalSize += stats.size;
                }
            }
        } catch (error) {
            this.log(`Error reading directory ${dirPath}: ${error.message}`, 'warning');
        }
        
        return totalSize;
    }

    async checkBuildHealth() {
        const checks = [
            this.checkNextConfig(),
            this.checkPackageJson(),
            this.checkEnvironmentVariables(),
            this.checkStaticAssets()
        ];

        const results = await Promise.allSettled(checks);
        
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                this.buildMetrics.errors.push(result.reason.message);
            }
        });
    }

    checkNextConfig() {
        return new Promise((resolve, reject) => {
            try {
                const configPath = path.join(process.cwd(), 'next.config.mjs');
                if (!fs.existsSync(configPath)) {
                    reject(new Error('next.config.mjs not found'));
                    return;
                }
                
                this.log('✅ Next.js config found');
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    checkPackageJson() {
        return new Promise((resolve, reject) => {
            try {
                const packagePath = path.join(process.cwd(), 'package.json');
                const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
                
                if (!packageJson.scripts || !packageJson.scripts.build) {
                    reject(new Error('Build script not found in package.json'));
                    return;
                }
                
                this.log('✅ Package.json build script found');
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    checkEnvironmentVariables() {
        return new Promise((resolve) => {
            const requiredEnvVars = [
                'NODE_ENV'
            ];
            
            const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
            
            if (missingVars.length > 0) {
                this.buildMetrics.warnings.push(`Missing environment variables: ${missingVars.join(', ')}`);
                this.log(`⚠️ Missing environment variables: ${missingVars.join(', ')}`, 'warning');
            } else {
                this.log('✅ Environment variables check passed');
            }
            
            resolve();
        });
    }

    checkStaticAssets() {
        return new Promise((resolve) => {
            try {
                const publicDir = path.join(process.cwd(), 'public');
                if (fs.existsSync(publicDir)) {
                    const size = this.getDirectorySize(publicDir);
                    this.buildMetrics.performance.staticAssetsSize = size;
                    this.log(`Static assets size: ${(size / 1024 / 1024).toFixed(2)} MB`);
                }
                resolve();
            } catch (error) {
                this.log(`Warning: Could not check static assets: ${error.message}`, 'warning');
                resolve();
            }
        });
    }

    async runBuild() {
        try {
            this.log('🚀 Starting build process...');
            
            // Pre-build health check
            await this.checkBuildHealth();
            
            // Run the actual build
            const buildCommand = 'npm run build:fast';
            this.log(`Running: ${buildCommand}`);
            
            execSync(buildCommand, { 
                stdio: 'inherit',
                env: { 
                    ...process.env, 
                    NODE_ENV: 'production',
                    NEXT_TELEMETRY_DISABLED: '1'
                }
            });
            
            this.buildMetrics.success = true;
            this.log('✅ Build completed successfully');
            
            // Post-build analysis
            await this.measureBundleSize();
            
        } catch (error) {
            this.buildMetrics.success = false;
            this.buildMetrics.errors.push(error.message);
            this.log(`❌ Build failed: ${error.message}`, 'error');
            throw error;
        }
    }

    generateReport() {
        this.buildMetrics.endTime = Date.now();
        this.buildMetrics.duration = this.buildMetrics.endTime - this.buildMetrics.startTime;
        
        const report = {
            ...this.buildMetrics,
            durationFormatted: `${(this.buildMetrics.duration / 1000).toFixed(2)}s`,
            timestamp: new Date().toISOString()
        };
        
        // Save report to file
        const reportPath = path.join(process.cwd(), 'build-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        // Console summary
        console.log('\n📊 Build Report Summary:');
        console.log(`⏱️  Duration: ${report.durationFormatted}`);
        console.log(`✅ Success: ${report.success}`);
        console.log(`📦 Bundle Size: ${report.bundleSize ? (report.bundleSize.total / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'}`);
        console.log(`⚠️  Warnings: ${report.warnings.length}`);
        console.log(`❌ Errors: ${report.errors.length}`);
        
        if (report.warnings.length > 0) {
            console.log('\nWarnings:');
            report.warnings.forEach(warning => console.log(`  - ${warning}`));
        }
        
        if (report.errors.length > 0) {
            console.log('\nErrors:');
            report.errors.forEach(error => console.log(`  - ${error}`));
        }
        
        console.log(`\n📄 Full report saved to: ${reportPath}`);
        
        return report;
    }
}

// Run if called directly
if (require.main === module) {
    const monitor = new BuildMonitor();
    
    monitor.runBuild()
        .then(() => {
            const report = monitor.generateReport();
            process.exit(report.success ? 0 : 1);
        })
        .catch((error) => {
            console.error('Build monitoring failed:', error);
            monitor.generateReport();
            process.exit(1);
        });
}

module.exports = BuildMonitor;
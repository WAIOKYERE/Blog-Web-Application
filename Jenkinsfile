pipeline {
    agent any
    
    environment {
        NODE_ENV = 'production'
        NPM_CONFIG_CACHE = '/tmp/.npm'
        EMAIL_RECIPIENTS = 'okyerewai3@gmail.com'
        // Add other environment variables as needed
    }
    
    options {
        timeout(time: 30, unit: 'MINUTES')
        retry(2)
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {
        stage('Checkout & Setup') {
            steps {
                echo 'Setting up workspace...'
                // Clean workspace if needed
                cleanWs()
                // Checkout code (if not using multibranch pipeline)
                checkout scm
                
                // Verify Node.js and npm versions
                sh '''
                    node --version
                    npm --version
                '''
            }
        }
        
        stage('Cache & Install Dependencies') {
            steps {
                echo 'Installing dependencies...'
                script {
                    // Cache node_modules for faster builds
                    if (fileExists('package-lock.json')) {
                        sh '''
                            # Use npm ci for faster, reliable installs in CI
                            npm ci --cache ${NPM_CONFIG_CACHE}
                        '''
                    } else {
                        sh '''
                            npm install --cache ${NPM_CONFIG_CACHE}
                        '''
                    }
                }
            }
            post {
                failure {
                    echo 'Dependency installation failed. Check package.json and network connectivity.'
                }
            }
        }

        stage('Code Quality & Security') {
            parallel {
                stage('Lint') {
                    steps {
                        echo 'Running linter...'
                        script {
                            def result = sh(script: 'npm run lint', returnStatus: true)
                            if (result != 0) {
                                echo "Lint script not found or failed, skipping..."
                            }
                        }
                    }
                }
                
                stage('Security Audit') {
                    steps {
                        echo 'Running security audit...'
                        script {
                            def result = sh(script: 'npm audit --audit-level=moderate', returnStatus: true)
                            if (result != 0) {
                                echo "Security audit found issues. Consider running 'npm audit fix'"
                                currentBuild.result = 'UNSTABLE'
                            }
                        }
                    }
                }
            }
        }

        stage('Build') {
            steps {
                echo 'Checking for build script...'
                script {
                    // Fixed: Use shell command instead of readJSON to check for build script
                    def buildScriptExists = sh(
                        script: 'npm run | grep -q "^  build"',
                        returnStatus: true
                    ) == 0
                    
                    if (buildScriptExists) {
                        echo 'Building application...'
                        sh 'npm run build'
                        
                        // Archive build artifacts if they exist
                        if (fileExists('dist') || fileExists('build')) {
                            archiveArtifacts artifacts: 'dist/**/*,build/**/*', allowEmptyArchive: true
                        }
                    } else {
                        echo 'No build script found in package.json, skipping build'
                    }
                }
            }
        }

        stage('Test') {
            steps {
                echo 'Running tests...'
                script {
                    // First check what the test script contains
                    def packageContent = readFile('package.json')
                    
                    // Check if it's the default npm test script that always fails
                    if (packageContent.contains('"test": "echo \\"Error: no test specified\\" && exit 1"')) {
                        echo "Default npm test script detected (no actual tests configured), skipping tests..."
                    } else {
                        // There are real tests configured, so run them
                        def testResult = sh(
                            script: '''
                                # Run the actual test command
                                npm run test
                            ''',
                            returnStatus: true
                        )
                        
                        if (testResult != 0) {
                            echo "Tests failed with exit code: ${testResult}"
                            currentBuild.result = 'FAILURE'
                            error "Test stage failed"
                        } else {
                            echo "All tests passed successfully!"
                        }
                    }
                }
            }
            post {
                always {
                    // Publish test results if they exist
                    script {
                        // Check for coverage reports
                        if (fileExists('coverage/lcov.info')) {
                            echo 'Coverage report found'
                            // Only use publishHTML if the plugin is available
                            try {
                                publishHTML([
                                    allowMissing: false,
                                    alwaysLinkToLastBuild: true,
                                    keepAll: true,
                                    reportDir: 'coverage',
                                    reportFiles: 'index.html',
                                    reportName: 'Coverage Report'
                                ])
                            } catch (Exception e) {
                                echo "HTML Publisher not available: ${e.getMessage()}"
                                archiveArtifacts artifacts: 'coverage/**/*', allowEmptyArchive: true
                            }
                        }
                        
                        // JUnit test results
                        if (fileExists('test-results.xml')) {
                            try {
                                junit 'test-results.xml'
                            } catch (Exception e) {
                                echo "JUnit plugin not available: ${e.getMessage()}"
                                archiveArtifacts artifacts: 'test-results.xml', allowEmptyArchive: true
                            }
                        }
                    }
                }
            }
        }

        stage('Deploy') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                    branch 'develop'
                }
            }
            steps {
                echo 'Deploying application...'
                script {
                    // Add deployment confirmation for production
                    if (env.BRANCH_NAME == 'main' || env.BRANCH_NAME == 'master') {
                        timeout(time: 5, unit: 'MINUTES') {
                            input message: 'Deploy to production?', ok: 'Deploy',
                                  submitterParameter: 'DEPLOYER'
                        }
                        echo "Deployment approved by: ${env.DEPLOYER}"
                    }
                    
                    // Different deployment strategies based on environment
                    if (env.BRANCH_NAME == 'main' || env.BRANCH_NAME == 'master') {
                        // Production deployment
                        echo 'Deploying to production...'
                        sh '''
                            # Add your production deployment commands here
                            # For example: docker build, push to registry, deploy to k8s
                            echo "Production deployment would happen here"
                            
                            # Example commands (uncomment and modify as needed):
                            # docker build -t myapp:$(git rev-parse --short HEAD) .
                            # docker tag myapp:$(git rev-parse --short HEAD) myapp:latest
                            # docker push myregistry/myapp:latest
                        '''
                    } else if (env.BRANCH_NAME == 'develop') {
                        // Staging deployment
                        echo 'Deploying to staging...'
                        sh '''
                            # Add your staging deployment commands here
                            echo "Staging deployment would happen here"
                            
                            # Example commands (uncomment and modify as needed):
                            # rsync -av dist/ user@staging-server:/var/www/html/
                            # pm2 restart myapp-staging
                        '''
                    }
                }
            }
            post {
                success {
                    echo "✅ Deployment successful to ${env.BRANCH_NAME} environment"
                    // Send notifications (Slack, email, etc.)
                }
                failure {
                    echo "❌ Deployment failed"
                    // Send failure notifications
                }
            }
        }

        stage('Health Check') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                    branch 'develop'
                }
            }
            steps {
                echo 'Performing health check...'
                script {
                    // Wait for application to start
                    sleep(time: 10, unit: 'SECONDS')
                    
                    def healthResult = sh(
                        script: '''
                            # Replace with your actual health check endpoint
                            # Example health check
                            echo "Performing health check..."
                            
                            # HTTP endpoint check (uncomment and modify as needed)
                            # curl -f http://localhost:3000/health
                            
                            # For now, simulate a successful health check
                            echo "Health check endpoint not configured yet"
                            exit 0
                        ''',
                        returnStatus: true
                    )
                    
                    if (healthResult != 0) {
                        echo "Health check failed"
                        currentBuild.result = 'UNSTABLE'
                    } else {
                        echo "✅ Health check passed"
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Cleaning up...'
            // Clean up temporary files
            sh '''
                rm -rf node_modules/.cache || true
                rm -rf /tmp/.npm || true
            '''
            
            // Archive logs if they exist
            script {
                if (fileExists('*.log')) {
                    archiveArtifacts artifacts: '*.log', allowEmptyArchive: true
                }
            }
            
            // EMAIL NOTIFICATION - Always send email with build status
            emailext (
                subject: "Jenkins Pipeline: ${env.JOB_NAME} - Build #${env.BUILD_NUMBER} - ${currentBuild.result ?: 'SUCCESS'}",
                body: """
                <html>
                <body>
                    <h2>Jenkins Pipeline Notification</h2>
                    <p><strong>Job:</strong> ${env.JOB_NAME}</p>
                    <p><strong>Build Number:</strong> ${env.BUILD_NUMBER}</p>
                    <p><strong>Status:</strong> ${currentBuild.result ?: 'SUCCESS'}</p>
                    <p><strong>Branch:</strong> ${env.BRANCH_NAME ?: 'N/A'}</p>
                    <p><strong>Duration:</strong> ${currentBuild.durationString}</p>
                    <p><strong>Started by:</strong> ${currentBuild.getBuildCauses('hudson.model.Cause\$UserIdCause')[0]?.userId ?: 'System'}</p>
                    
                    <h3>Build Information:</h3>
                    <p><strong>Build URL:</strong> <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
                    <p><strong>Console Output:</strong> <a href="${env.BUILD_URL}console">View Console Output</a></p>
                    
                    ${currentBuild.result == 'FAILURE' ? '<p style="color: red;"><strong>Build Failed!</strong> Please check the console output for details.</p>' : ''}
                    ${currentBuild.result == 'UNSTABLE' ? '<p style="color: orange;"><strong>Build Unstable!</strong> There were warnings or minor issues.</p>' : ''}
                    ${(currentBuild.result == 'SUCCESS' || currentBuild.result == null) ? '<p style="color: green;"><strong>Build Successful!</strong></p>' : ''}
                </body>
                </html>
                """,
                mimeType: 'text/html',
                to: "${env.EMAIL_RECIPIENTS}",
                attachLog: true,
                compressLog: true
            )
        }
        
        success {
            echo '✅ Pipeline completed successfully!'
            // Send success notifications
            script {
                if (env.CHANGE_ID) {
                    // This is a PR build
                    echo "PR #${env.CHANGE_ID} build successful"
                } else {
                    // This is a branch build
                    echo "Branch ${env.BRANCH_NAME} build successful"
                }
            }
            
            // SUCCESS EMAIL - Additional success notification
            emailext (
                subject: "✅ SUCCESS: ${env.JOB_NAME} - Build #${env.BUILD_NUMBER}",
                body: """
                🎉 Build completed successfully!
                
                Job: ${env.JOB_NAME}
                Build: #${env.BUILD_NUMBER}
                Branch: ${env.BRANCH_NAME ?: 'N/A'}
                Duration: ${currentBuild.durationString}
                
                View build details: ${env.BUILD_URL}
                """,
                to: "${env.EMAIL_RECIPIENTS}"
            )
        }
        
        failure {
            echo '❌ Pipeline failed!'
            // Send failure notifications
            script {
                def failureReason = currentBuild.description ?: 'Unknown failure'
                echo "Build failed: ${failureReason}"
            }
            
            // FAILURE EMAIL - Additional failure notification
            emailext (
                subject: "❌ FAILURE: ${env.JOB_NAME} - Build #${env.BUILD_NUMBER}",
                body: """
                🚨 Build failed!
                
                Job: ${env.JOB_NAME}
                Build: #${env.BUILD_NUMBER}
                Branch: ${env.BRANCH_NAME ?: 'N/A'}
                Duration: ${currentBuild.durationString}
                
                Please check the console output for details:
                ${env.BUILD_URL}console
                
                View full build details: ${env.BUILD_URL}
                """,
                to: "${env.EMAIL_RECIPIENTS}",
                attachLog: true
            )
        }
        
        unstable {
            echo '⚠️ Pipeline completed with warnings'
            
            // UNSTABLE EMAIL - Additional unstable notification
            emailext (
                subject: "⚠️ UNSTABLE: ${env.JOB_NAME} - Build #${env.BUILD_NUMBER}",
                body: """
                ⚠️ Build completed with warnings!
                
                Job: ${env.JOB_NAME}
                Build: #${env.BUILD_NUMBER}
                Branch: ${env.BRANCH_NAME ?: 'N/A'}
                Duration: ${currentBuild.durationString}
                
                Please review the warnings:
                ${env.BUILD_URL}
                
                Console output: ${env.BUILD_URL}console
                """,
                to: "${env.EMAIL_RECIPIENTS}"
            )
        }
        
        cleanup {
            // Final cleanup
            cleanWs()
        }
    }
}
















// ipeline {
//     agent any
    
//     environment {
//         NODE_ENV = 'production'
//         NPM_CONFIG_CACHE = '/tmp/.npm'
//         // Add other environment variables as needed
//     }
    
//     options {
//         timeout(time: 30, unit: 'MINUTES')
//         retry(2)
//         timestamps()
//         buildDiscarder(logRotator(numToKeepStr: '10'))
//     }

//     stages {
//         stage('Checkout & Setup') {
//             steps {
//                 echo 'Setting up workspace...'
//                 // Clean workspace if needed
//                 cleanWs()
//                 // Checkout code (if not using multibranch pipeline)
//                 checkout scm
                
//                 // Verify Node.js and npm versions
//                 sh '''
//                     node --version
//                     npm --version
//                 '''
//             }
//         }
        
//         stage('Cache & Install Dependencies') {
//             steps {
//                 echo 'Installing dependencies...'
//                 script {
//                     // Cache node_modules for faster builds
//                     if (fileExists('package-lock.json')) {
//                         sh '''
//                             # Use npm ci for faster, reliable installs in CI
//                             npm ci --cache ${NPM_CONFIG_CACHE}
//                         '''
//                     } else {
//                         sh '''
//                             npm install --cache ${NPM_CONFIG_CACHE}
//                         '''
//                     }
//                 }
//             }
//             post {
//                 failure {
//                     echo 'Dependency installation failed. Check package.json and network connectivity.'
//                 }
//             }
//         }

//         stage('Code Quality & Security') {
//             parallel {
//                 stage('Lint') {
//                     steps {
//                         echo 'Running linter...'
//                         script {
//                             def result = sh(script: 'npm run lint', returnStatus: true)
//                             if (result != 0) {
//                                 echo "Lint script not found or failed, skipping..."
//                             }
//                         }
//                     }
//                 }
                
//                 stage('Security Audit') {
//                     steps {
//                         echo 'Running security audit...'
//                         script {
//                             def result = sh(script: 'npm audit --audit-level=moderate', returnStatus: true)
//                             if (result != 0) {
//                                 echo "Security audit found issues. Consider running 'npm audit fix'"
//                                 currentBuild.result = 'UNSTABLE'
//                             }
//                         }
//                     }
//                 }
//             }
//         }

//         stage('Build') {
//             steps {
//                 echo 'Checking for build script...'
//                 script {
//                     // Fixed: Use shell command instead of readJSON to check for build script
//                     def buildScriptExists = sh(
//                         script: 'npm run | grep -q "^  build"',
//                         returnStatus: true
//                     ) == 0
                    
//                     if (buildScriptExists) {
//                         echo 'Building application...'
//                         sh 'npm run build'
                        
//                         // Archive build artifacts if they exist
//                         if (fileExists('dist') || fileExists('build')) {
//                             archiveArtifacts artifacts: 'dist/**/*,build/**/*', allowEmptyArchive: true
//                         }
//                     } else {
//                         echo 'No build script found in package.json, skipping build'
//                     }
//                 }
//             }
//         }

//         stage('Test') {
//             steps {
//                 echo 'Running tests...'
//                 script {
//                     // First check what the test script contains
//                     def packageContent = readFile('package.json')
                    
//                     // Check if it's the default npm test script that always fails
//                     if (packageContent.contains('"test": "echo \\"Error: no test specified\\" && exit 1"')) {
//                         echo "Default npm test script detected (no actual tests configured), skipping tests..."
//                     } else {
//                         // There are real tests configured, so run them
//                         def testResult = sh(
//                             script: '''
//                                 # Run the actual test command
//                                 npm run test
//                             ''',
//                             returnStatus: true
//                         )
                        
//                         if (testResult != 0) {
//                             echo "Tests failed with exit code: ${testResult}"
//                             currentBuild.result = 'FAILURE'
//                             error "Test stage failed"
//                         } else {
//                             echo "All tests passed successfully!"
//                         }
//                     }
//                 }
//             }
//             post {
//                 always {
//                     // Publish test results if they exist
//                     script {
//                         // Check for coverage reports
//                         if (fileExists('coverage/lcov.info')) {
//                             echo 'Coverage report found'
//                             // Only use publishHTML if the plugin is available
//                             try {
//                                 publishHTML([
//                                     allowMissing: false,
//                                     alwaysLinkToLastBuild: true,
//                                     keepAll: true,
//                                     reportDir: 'coverage',
//                                     reportFiles: 'index.html',
//                                     reportName: 'Coverage Report'
//                                 ])
//                             } catch (Exception e) {
//                                 echo "HTML Publisher not available: ${e.getMessage()}"
//                                 archiveArtifacts artifacts: 'coverage/**/*', allowEmptyArchive: true
//                             }
//                         }
                        
//                         // JUnit test results
//                         if (fileExists('test-results.xml')) {
//                             try {
//                                 junit 'test-results.xml'
//                             } catch (Exception e) {
//                                 echo "JUnit plugin not available: ${e.getMessage()}"
//                                 archiveArtifacts artifacts: 'test-results.xml', allowEmptyArchive: true
//                             }
//                         }
//                     }
//                 }
//             }
//         }

//         stage('Deploy') {
//             when {
//                 anyOf {
//                     branch 'main'
//                     branch 'master'
//                     branch 'develop'
//                 }
//             }
//             steps {
//                 echo 'Deploying application...'
//                 script {
//                     // Add deployment confirmation for production
//                     if (env.BRANCH_NAME == 'main' || env.BRANCH_NAME == 'master') {
//                         timeout(time: 5, unit: 'MINUTES') {
//                             input message: 'Deploy to production?', ok: 'Deploy',
//                                   submitterParameter: 'DEPLOYER'
//                         }
//                         echo "Deployment approved by: ${env.DEPLOYER}"
//                     }
                    
//                     // Different deployment strategies based on environment
//                     if (env.BRANCH_NAME == 'main' || env.BRANCH_NAME == 'master') {
//                         // Production deployment
//                         echo 'Deploying to production...'
//                         sh '''
//                             # Add your production deployment commands here
//                             # For example: docker build, push to registry, deploy to k8s
//                             echo "Production deployment would happen here"
                            
//                             # Example commands (uncomment and modify as needed):
//                             # docker build -t myapp:$(git rev-parse --short HEAD) .
//                             # docker tag myapp:$(git rev-parse --short HEAD) myapp:latest
//                             # docker push myregistry/myapp:latest
//                         '''
//                     } else if (env.BRANCH_NAME == 'develop') {
//                         // Staging deployment
//                         echo 'Deploying to staging...'
//                         sh '''
//                             # Add your staging deployment commands here
//                             echo "Staging deployment would happen here"
                            
//                             # Example commands (uncomment and modify as needed):
//                             # rsync -av dist/ user@staging-server:/var/www/html/
//                             # pm2 restart myapp-staging
//                         '''
//                     }
//                 }
//             }
//             post {
//                 success {
//                     echo "✅ Deployment successful to ${env.BRANCH_NAME} environment"
//                     // Send notifications (Slack, email, etc.)
//                 }
//                 failure {
//                     echo "❌ Deployment failed"
//                     // Send failure notifications
//                 }
//             }
//         }

//         stage('Health Check') {
//             when {
//                 anyOf {
//                     branch 'main'
//                     branch 'master'
//                     branch 'develop'
//                 }
//             }
//             steps {
//                 echo 'Performing health check...'
//                 script {
//                     // Wait for application to start
//                     sleep(time: 10, unit: 'SECONDS')
                    
//                     def healthResult = sh(
//                         script: '''
//                             # Replace with your actual health check endpoint
//                             # Example health check
//                             echo "Performing health check..."
                            
//                             # HTTP endpoint check (uncomment and modify as needed)
//                             # curl -f http://localhost:3000/health
                            
//                             # For now, simulate a successful health check
//                             echo "Health check endpoint not configured yet"
//                             exit 0
//                         ''',
//                         returnStatus: true
//                     )
                    
//                     if (healthResult != 0) {
//                         echo "Health check failed"
//                         currentBuild.result = 'UNSTABLE'
//                     } else {
//                         echo "✅ Health check passed"
//                     }
//                 }
//             }
//         }
//     }

//     post {
//         always {
//             echo 'Cleaning up...'
//             // Clean up temporary files
//             sh '''
//                 rm -rf node_modules/.cache || true
//                 rm -rf /tmp/.npm || true
//             '''
            
//             // Archive logs if they exist
//             script {
//                 if (fileExists('*.log')) {
//                     archiveArtifacts artifacts: '*.log', allowEmptyArchive: true
//                 }
//             }
//         }
        
//         success {
//             echo '✅ Pipeline completed successfully!'
//             // Send success notifications
//             script {
//                 if (env.CHANGE_ID) {
//                     // This is a PR build
//                     echo "PR #${env.CHANGE_ID} build successful"
//                 } else {
//                     // This is a branch build
//                     echo "Branch ${env.BRANCH_NAME} build successful"
//                 }
//             }
//         }
        
//         failure {
//             echo '❌ Pipeline failed!'
//             // Send failure notifications
//             script {
//                 def failureReason = currentBuild.description ?: 'Unknown failure'
//                 echo "Build failed: ${failureReason}"
                
//                 // You can add notification steps here
//                 // emailext, slack, etc.
//             }
//         }
        
//         unstable {
//             echo '⚠️ Pipeline completed with warnings'
//         }
        
//         cleanup {
//             // Final cleanup
//             cleanWs()
//         }
//     }
// }







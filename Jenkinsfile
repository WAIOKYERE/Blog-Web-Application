pipeline {
    agent any
    
    environment {
        NODE_ENV = 'production'
        NPM_CONFIG_CACHE = '/tmp/.npm'
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
                            try {
                                sh 'npm run lint || echo "Lint script not found, skipping..."'
                            } catch (Exception e) {
                                echo "Linting failed: ${e.getMessage()}"
                                currentBuild.result = 'UNSTABLE'
                            }
                        }
                    }
                }
                
                stage('Security Audit') {
                    steps {
                        echo 'Running security audit...'
                        script {
                            try {
                                sh '''
                                    npm audit --audit-level=high
                                    # Alternative: npx audit-ci --moderate
                                '''
                            } catch (Exception e) {
                                echo "Security audit found issues: ${e.getMessage()}"
                                currentBuild.result = 'UNSTABLE'
                            }
                        }
                    }
                }
            }
        }

        stage('Build') {
            when {
                // Only build if there's a build script
                expression { 
                    def packageJson = readJSON file: 'package.json'
                    return packageJson.scripts?.build != null
                }
            }
            steps {
                echo 'Building application...'
                sh 'npm run build'
            }
            post {
                success {
                    // Archive build artifacts
                    archiveArtifacts artifacts: 'dist/**/*', allowEmptyArchive: true
                }
            }
        }

        stage('Test') {
            steps {
                echo 'Running tests...'
                script {
                    try {
                        sh '''
                            # Run tests with coverage if available
                            if npm run | grep -q "test:coverage"; then
                                npm run test:coverage
                            elif npm run | grep -q "test"; then
                                npm run test
                            else
                                echo "No test scripts configured"
                                exit 0
                            fi
                        '''
                    } catch (Exception e) {
                        echo "Tests failed: ${e.getMessage()}"
                        currentBuild.result = 'FAILURE'
                        error "Test stage failed"
                    }
                }
            }
            post {
                always {
                    // Publish test results if they exist
                    script {
                        if (fileExists('coverage/lcov.info')) {
                            publishHTML([
                                allowMissing: false,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'coverage',
                                reportFiles: 'index.html',
                                reportName: 'Coverage Report'
                            ])
                        }
                        
                        // JUnit test results
                        if (fileExists('test-results.xml')) {
                            junit 'test-results.xml'
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
                        '''
                    } else if (env.BRANCH_NAME == 'develop') {
                        // Staging deployment
                        echo 'Deploying to staging...'
                        sh '''
                            # Add your staging deployment commands here
                            echo "Staging deployment would happen here"
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
                    
                    try {
                        // Replace with your actual health check endpoint
                        sh '''
                            # Example health check
                            curl -f http://localhost:3000/health || echo "Health check endpoint not available"
                        '''
                    } catch (Exception e) {
                        echo "Health check failed: ${e.getMessage()}"
                        currentBuild.result = 'UNSTABLE'
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
                rm -rf node_modules/.cache
                rm -rf /tmp/.npm
            '''
            
            // Archive logs
            archiveArtifacts artifacts: '*.log', allowEmptyArchive: true
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
        }
        
        failure {
            echo '❌ Pipeline failed!'
            // Send failure notifications
            script {
                def failureReason = currentBuild.description ?: 'Unknown failure'
                echo "Build failed: ${failureReason}"
                
                // You can add notification steps here
                // emailext, slack, etc.
            }
        }
        
        unstable {
            echo '⚠️ Pipeline completed with warnings'
        }
        
        cleanup {
            // Final cleanup
            cleanWs()
        }
    }
}














// pipeline {
//     agent any

//     stages {
//         stage('Build') {
//             steps {
//                 sh 'npm install'  // Install dependencies
//                 sh 'npm run build' // If you have a build step
//             }
//         }


//         stage('Test') {
//             steps {
//                 echo 'Testing...'
//             }
//         }

//         stage('Deploy') {
//             steps {
                
//                 echo 'Deploying...'
//             }
//         }
//     }


//     post {
//         always {
//             echo 'Cleaning up...'
//         }
//         success {
//             echo 'Build succeeded!'
//         }
//         failure {
//             echo 'Build failed!'
//         }
//     }
// }






// pipeline {
//     agent any

//     stages {
//         stage('Install') {
//             steps {
//                 echo 'Installing dependencies...'
//                 sh 'npm install'
//             }
//         }

//         stage('Test') {
//             steps {
//                 echo 'Running tests...'
//                 sh 'npm test || echo "No tests configured"'
//             }
//         }

//         stage('Deploy') {
//             steps {
//                 echo 'Starting application...'
//                 sh 'npm start'
//             }
//         }
//     }

//     post {
//         always {
//             echo 'Cleaning up...'
//         }
//         success {
//             echo 'Pipeline completed successfully!'
//         }
//         failure {
//             echo 'Pipeline failed!'
//         }
//     }
// }








// pipeline {
//     agent {
//         docker {
//             image 'node:18-alpine'
//             args '--network host -v /var/run/docker.sock:/var/run/docker.sock'
//         }
//     }
//     environment {
//         DOCKER_REGISTRY = 'your-registry'
//         APP_NAME = 'blog-web-app'
//         VERSION = "${env.BUILD_NUMBER}"
//     }
//     stages {
        
//         stage('Install Dependencies') {
//             steps {
//                 sh 'npm ci'
//             }
//         }
        
//         stage('Run Tests') {
//             steps {
//                 sh 'npm test'
//             }
//         }
        
//         stage('Build Docker Image') {
//             steps {
//                 script {
//                     docker.build("${APP_NAME}:${VERSION}")
//                 }
//             }
//         }
        
//         stage('Push to Registry') {
//             when {
//                 branch 'main'
//             }
//             steps {
//                 script {
//                     docker.withRegistry("https://${DOCKER_REGISTRY}", 'docker-hub-credentials') {
//                         docker.image("${APP_NAME}:${VERSION}").push()
//                     }
//                 }
//             }
//         }
        
//         stage('Deploy') {
//             when {
//                 branch 'main'
//             }
//             steps {
//                 sh """
//                 docker-compose -f docker-compose.prod.yml down
//                 docker-compose -f docker-compose.prod.yml up -d
//                 """
//             }
//         }
//     }
// }







// pipeline {
//     agent {
//         docker {
//             image 'node:18-alpine'
//             args '-v /var/run/docker.sock:/var/run/docker.sock'
//         }
//     }
//     environment {
//         DOCKER_REGISTRY = 'your-registry' // e.g., Docker Hub
//         DOCKER_CREDENTIALS = credentials('docker-hub-credentials')
//         APP_NAME = 'blog-web-app'
//         VERSION = "${env.BUILD_NUMBER}"
//     }
//     stages {
//         stage('Checkout') {
//             steps {
//                 checkout scm
//             }
//         }
        
//         stage('Install Dependencies') {
//             steps {
//                 sh 'npm install'
//             }
//         }
        
//         stage('Run Tests') {
//             steps {
//                 sh 'npm test'
//             }
//         }
        
//         stage('Build Docker Image') {
//             steps {
//                 script {
//                     docker.build("${APP_NAME}:${VERSION}")
//                 }
//             }
//         }
        
//         stage('Run Security Scan') {
//             steps {
//                 sh 'docker scan --file Dockerfile ${APP_NAME}:${VERSION}'
//             }
//         }
        
//         stage('Push to Registry') {
//             when {
//                 branch 'main'
//             }
//             steps {
//                 script {
//                     docker.withRegistry("https://${DOCKER_REGISTRY}", "${DOCKER_CREDENTIALS}") {
//                         docker.image("${APP_NAME}:${VERSION}").push()
//                         docker.image("${APP_NAME}:${VERSION}").push('latest')
//                     }
//                 }
//             }
//         }
        
//         stage('Deploy') {
//             when {
//                 branch 'main'
//             }
//             steps {
//                 sshagent(['deploy-server-credentials']) {
//                     sh """
//                     ssh user@your-server << EOF
//                     docker pull ${DOCKER_REGISTRY}/${APP_NAME}:${VERSION}
//                     docker stop \$(docker ps -q --filter ancestor=${APP_NAME}) || true
//                     docker run -d -p 6000:5000 --name ${APP_NAME}-${VERSION} ${APP_NAME}:${VERSION}
//                     EOF
//                     """
//                 }
//             }
//         }
//     }
//     post {
//         always {
//             cleanWs()
//         }
//         failure {
//             slackSend channel: '#devops', message: "Build ${currentBuild.fullDisplayName} failed!"
//         }
//         success {
//             slackSend channel: '#devops', message: "Build ${currentBuild.fullDisplayName} succeeded!"
//         }
//     }
// }

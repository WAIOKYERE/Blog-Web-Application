pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'blog-web-app:latest'
        EMAIL_RECIPIENTS = 'you@example.com'
    }

    stages {
        stage('Pre-Setup') {
            steps {
                sh 'git config --global http.postBuffer 524288000'
            }
        }

        stage('Checkout') {
            steps {
                sh 'git config --global http.postBuffer 524288000'
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[
                        url: 'https://github.com/WAIOKYERE/Blog-Web-Application.git',
                        credentialsId: 'Pipeline_login'
                    ]],
                    extensions: [[$class: 'CloneOption', shallow: true, depth: 1]]
                ])
            }
            post {
                failure {
                    mail to: "${EMAIL_RECIPIENTS}",
                         subject: "❌ Checkout Failed",
                         body: "Checkout failed. Please review the Jenkins logs."
                }
            }
        }

        stage('Build') {
            steps {
                sh 'docker build -t $DOCKER_IMAGE .'
            }
            post {
                failure {
                    mail to: "${EMAIL_RECIPIENTS}",
                         subject: "❌ Build Failed",
                         body: "Build failed after checkout. Check Jenkins logs."
                }
            }
        }

        stage('Test') {
            steps {
                sh 'docker run --rm $DOCKER_IMAGE npm test'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying...'
            }
            post {
                success {
                    mail to: "${EMAIL_RECIPIENTS}",
                         subject: "✅ Deploy Successful",
                         body: "Deployment completed successfully."
                }
                failure {
                    mail to: "${EMAIL_RECIPIENTS}",
                         subject: "❌ Deploy Failed",
                         body: "Deployment failed. Check Jenkins logs."
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}

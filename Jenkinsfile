pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'blog-web-app:latest'
        EMAIL_RECIPIENTS = 'waiokyere3@outlook.com' 

    stages {
        stage('Pre-Setup') {
            steps {
                sh 'git config --global http.postBuffer 524288000'
            }
            post {
                failure {
                    mail to: "${EMAIL_RECIPIENTS}",
                         subject: "❌ Blog Web App: Pre-Setup Failed",
                         body: "The pipeline failed at the Pre-Setup stage."
                }
            }
        }

        stage('Checkout') {
            steps {
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
                         subject: "❌ Blog Web App: Checkout Failed",
                         body: "The pipeline failed at the Checkout stage."
                }
            }
        }

        stage('Build') {
            steps {
                sh 'docker build -t $DOCKER_IMAGE .'
            }
        }

        stage('Test') {
            steps {
                sh 'docker run --rm $DOCKER_IMAGE npm test'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying application...'
                // Add deployment logic here
            }
            post {
                success {
                    mail to: "${EMAIL_RECIPIENTS}",
                         subject: "✅ Blog Web App: Deployment Successful",
                         body: "The application was deployed successfully."
                }
                failure {
                    mail to: "${EMAIL_RECIPIENTS}",
                         subject: "❌ Blog Web App: Deployment Failed",
                         body: "The deployment stage failed. Please check Jenkins logs for details."
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

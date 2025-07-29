pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'blog-web-app:latest'
        EMAIL_RECIPIENTS = 'waiokyere3@outlook.com'
    }

    stages {
        stage('Pre-Setup') {
            steps {
                sh 'git config --global http.postBuffer 524288000'
            }
        }

        stage('Build') {
            steps {
                sh 'docker-compose build'
            }
            post {
                failure {
                    mail to: "${EMAIL_RECIPIENTS}",
                         subject: "❌ Build Failed",
                         body: "Build failed. Check Jenkins logs."
                }
            }
        }

        stage('Test') {
            steps {
                sh 'docker-compose run --rm app npm test'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying...'
                // Add your deploy command here (e.g., docker-compose up -d)
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
            // Stop and clean up containers
            sh 'docker-compose down || true'
            cleanWs()
        }
    }
}


pipeline {
    agent any

    environment {
        EMAIL_RECIPIENTS = 'waiokyere3@outlook.com'
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
                sh 'docker-compose build'
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
                sh 'docker-compose run --rm app npm test'
            }
            post {
                failure {
                    mail to: "${EMAIL_RECIPIENTS}",
                         subject: "❌ Test Failed",
                         body: "Tests failed. Please check logs."
                }
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying...'
                sh 'docker-compose up -d'
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
            sh 'docker-compose down || true'
            cleanWs()
        }
    }
}

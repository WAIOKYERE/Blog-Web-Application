pipeline {
    agent {
        label 'kubeagent'
    }

    stages {
        stage('Code Checkout') {
            steps {
                sh "echo 'Checkout Completed'"
            }
        }
        stage('Build') {
            steps {
                sh "echo 'Build Completed'"
            }
        }
    }
    post {
        always {
            mail to: 'okyerewai3@gmail.com',
                 subject: "Jenkins Build Notification: ${currentBuild.fullDisplayName}",
                 body: """\
                 Build Status: ${currentBuild.currentResult}
                 Project: ${env.JOB_NAME}
                 Build Number: ${env.BUILD_NUMBER}
                 Build URL: ${env.BUILD_URL}
                 """
        }
    }
}
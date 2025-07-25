pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'blog-web-app:latest'
    }

    stages {
        stage('Pre-Setup') {
            steps {
                // Increase Git buffer to avoid fetch failure
                sh 'git config --global http.postBuffer 524288000'
            }
        }

        stage('Checkout') {
            steps {
                // Shallow clone to avoid large history and potential network issues
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
                // Add your real deploy logic here
            }
        }
    }

   post {
    always {
        cleanWs()
    }
    success {
        echo '✅ Pipeline completed successfully.'
    }
    failure {
        echo '❌ Pipeline failed.'
    }
}

}

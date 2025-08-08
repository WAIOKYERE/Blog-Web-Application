pipeline {
    agent any
    stages {
        stage('Check Docker') {
            steps {
                sh 'docker --version'
                sh 'docker pull node:18-alpine'
                sh 'docker run --rm node:18-alpine node -v'
            }
        }
    }
}







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
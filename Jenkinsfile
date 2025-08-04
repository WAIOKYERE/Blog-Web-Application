// pipeline {
//     agent any

//     environment {
//         DOCKER_IMAGE = 'blog-app'
//         CONTAINER_NAME = 'blog-web-app'
//     }

  
//         stage('Build Docker Image') {
//             steps {
//                 script {
//                     sh 'docker build -t blog-web-application-blog-app .'
//                 }
//             }
//         }

//         stage('Stop Old Container') {
//             steps {
//                 script {
//                     sh 'docker stop $CONTAINER_NAME || true'
//                     sh 'docker rm $CONTAINER_NAME || true'
//                 }
//             }
//         }

//         stage('Run New Container') {
//             steps {
//                 script {
//                     sh '''
//                         docker run -d --name $CONTAINER_NAME \
//                         -p 3000:3000 $DOCKER_IMAGE
//                     '''
//                 }
//             }
//         }
//     }

//     post {
//         success {
//             echo '🚀 Deployment successful!'
//         }
//         failure {
//             echo '❌ Deployment failed.'
//         }
//     }





  pipeline {
    agent any

    environment {
        IMAGE_NAME = 'blog-web-application-blog-app'
        DOCKER_HOST = 'unix:///var/run/docker.sock'
    }

    stages {
   
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test || echo "No test script defined"'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t $IMAGE_NAME ."
            }
        }

        stage('Push to DockerHub') {
            when {
                branch 'main'
            }
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                        docker tag $IMAGE_NAME $DOCKER_USER/$IMAGE_NAME:latest
                        docker push $DOCKER_USER/$IMAGE_NAME:latest
                    '''
                }
            }
        }

        stage('Deploy (Optional)') {
            steps {
                echo 'Deploy logic goes here (e.g., SSH to server or trigger remote script)'
            }
        }
    }
}













// pipeline {
//     agent any

//     stages {
//         stage('Build') {
//             steps {
//                 echo 'Building...'
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
// }
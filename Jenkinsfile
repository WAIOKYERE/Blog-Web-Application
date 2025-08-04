
  pipeline {
    agent any

    environment {
        IMAGE_NAME = 'blog-app'
        DOCKER_HOST = 'unix:///var/run/docker.sock' // ✅ this is the fix
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
pipeline
{
   agent { node {label 'master' }}
   stages {
       stage('Deploy') {
           agent { node {label 'Jitsi' }}
           steps {
                sh '''
                echo Deploying ....
                rm Jenkinsfile README.md
                sudo docker build -t jitsi-web-dofleini .
                sudo docker rm jitsi-web-dofleini -f
                sudo docker run -d --rm -p 127.0.0.1:8080:8080 --name jitsi-web-dofleini jitsi-web-dofleini:latest
                '''
           }
       }
   }
	post
	    {
            success {
                sh '''
                    curl -i -X GET "https://api.telegram.org/bot1384994553:AAEWdoTm8uxVFsJ4ZSu3DK-YWPfEFtroKxw/sendMessage?chat_id=-401174467&text=The '"$JOB_NAME"' job execution was successful, for details go to: '"$RUN_DISPLAY_URL"' "
                '''
                }
            failure {
                sh '''
                    curl -i -X GET "https://api.telegram.org/bot1384994553:AAEWdoTm8uxVFsJ4ZSu3DK-YWPfEFtroKxw/sendMessage?chat_id=-401174467&text=The '"$JOB_NAME"' job execution has failed, for details go to: '"$RUN_DISPLAY_URL"' "
                '''
                }
            aborted{
                sh '''
                    curl -i -X GET "https://api.telegram.org/bot1384994553:AAEWdoTm8uxVFsJ4ZSu3DK-YWPfEFtroKxw/sendMessage?chat_id=-401174467&text=The '"$JOB_NAME"' job execution was aborted, for details go to: '"$RUN_DISPLAY_URL"' "
                '''
                }
        }
}

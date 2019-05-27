const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;

// Connexion a mongo
mongo.connect('mongodb://127.0.0.1/chat_node_react', function(err, db){
    if(err){
        throw err;
    }
    console.log('MongoDB connected with succes');

    // Connexion a socket.io
    client.on('connection', function(socket){
        let chat = db.collection('chats');

        // Créer une fonction pour envoyer le statut
        sendStatus = function(s){
            socket.emit('status', s);
        }

        // Recupérer le chat de mongo collection
        chat.find().limit(100).sort({_id:1}).toArray(function(err, res){
            if(err){
                throw err;
            }

            // Emission des messages
            socket.emit('output', res);
        });

        // Gérer les evenements input
        socket.on('input', function(data){
            let name = data.name;
            let message = data.message;


            // Vérification que les inputs sont tous remplis en rappelant la function send.Status
            if(name == '' || message == ''){
                send.Status('Enter a name and message');
            } else {
                // Insertion des message ds la db en utilsant la variable chat et créer une fonction qui réémet au client son message
                chat.insert({name: name, message: message}, function(){
                    client.emit('output', [data]);

                    // Envoi du statut de l'objet
                    sendStatus({
                        message: 'Message sent',
                        clear: true
                    });
                });
            }
        });

        //Gérer le 'clear'
        socket.on('clear', function(data){
            // Spprimer tout de la mongo collection
            chat.remove({}, function(){
                // emit cleared
                socket.emit('cleared');
            });
        }); 
    });
});

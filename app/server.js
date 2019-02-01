import express from 'express';
import bodyParser from 'body-parser';
import router from './route';

const server = express();

server.use(express.json())
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));
server.use('/api/v1', router);

const PORT = process.env.PORT || 3000;
const app = server.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});

export default app;

import app from './app';

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () =>
    console.log(`Server is listening on ${PORT}`)
);

export default server;



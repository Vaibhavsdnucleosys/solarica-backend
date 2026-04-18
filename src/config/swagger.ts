import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Solarica Backend API',
            version: '1.0.0',
            description: 'API documentation for Solarica CRM and Invoice management system',
            contact: {
                name: 'Solarica Tech Team',
                // email: 'business@solarica.in',
            },
        },
        servers: [
            {
                url: process.env.BACKEND_URL ,
                description: 'Primary API Server',
            },
        ],
    },
    // Path to the API docs (where you define your @swagger annotations)
    apis: [
        path.join(__dirname, '../api/swagger/*.ts'),
        path.join(__dirname, '../api/router/*.ts'),
        path.join(__dirname, '../api/model/*.ts'),
    ],
};

export const swaggerSpec = swaggerJSDoc(options);


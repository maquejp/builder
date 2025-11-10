# API Endpoints in Backend Pattern

In the backend folder, it is important to define and organize API endpoints that the server will expose for client applications to interact with. The API endpoints should follow a clear and consistent naming convention to ensure ease of use and maintainability.

## ExpressJS

Note: we are working with typescript.

If you are using ExpressJS as your backend framework, you can define your API endpoints in a dedicated file, such as `routes.ts` or `api.ts`. Here is an example of how to structure your API endpoints:

### Folder structure

```text
backend
    ├── src/
    │   ├── routes/
    │   │   └── orderRoutes.ts
    │   ├── controllers/
    │   │   └── orderController.ts
    │   ├── models/
    │   │   └── orderModel.ts
    │   ├── services/
    │   │   └── orderService.ts
    │   ├── middlewares/
    │   │   ├── authMiddleware.ts
    │   │   └── errorMiddleware.ts
    │   ├── utils/
    │   │   └── logger.ts
    │   ├── config/
    │   │   └── dbConfig.ts
    │   └── app.ts
```

Eventually, the routes, controllers, services, and models can be grouped under a parent folder named after the feature, e.g., `orders/` , `products/`, `programme_1/`.

```text
backend
    ├── src/
    │   ├── routes/
    │   │   └── programme_1
    │   │       ├── installationRoutes.ts
    │   │       └── usageRoutes.ts
    │   ├── controllers/
    │   │   └── programme_1
    │   │       ├── installationController.ts
    │   │       └── usageController.ts
    │   ├── models/
    │   │   └── programme_1
    │   │       ├── installationModel.ts
    │   │       └── usageModel.ts
    │   ├── services/
    │   │   └── programme_1
    │   │       ├── installationService.ts
    │   │       └── usageService.ts
    │   ├── middlewares/
    │   │   ├── authMiddleware.ts
    │   │   └── errorMiddleware.ts
    │   ├── utils/
    │   │   └── logger.ts
    │   ├── config/
    │   │   └── dbConfig.ts
    │   └── app.ts
```

## Notes

Depending on the backend framework you are using, the structure and implementation of API endpoints may vary. Always refer to the official documentation of the framework for best practices and guidelines.

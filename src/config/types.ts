const TYPES = {
    // Repositories
    DelivererRepository: Symbol.for('DelivererRepository'),
    MotorcycleRespository: Symbol.for('MotorcycleRespository'),
    RentPlanRepository: Symbol.for('RentPlanRepository'),
    RentRepository: Symbol.for('RentRepository'),
    UserRepository: Symbol.for('UserRepository'),

    // Services

    AuthService: Symbol.for('AuthService'),
    DelivererService: Symbol.for('DelivererService'),
    MotorcycleService: Symbol.for('MotorcycleService'),
    RentBudgetService: Symbol.for('RentBudgetService'),
    RentService: Symbol.for('RentService'),
    SimplePaymentCalculationStrategy: Symbol.for(
        'SimplePaymentCalculationStrategy'
    ),
    UserService: Symbol.for('UserService'),

    // Controllers
    AuthController: Symbol.for('AuthController'),
    MotorcycleController: Symbol.for('MotorcycleController'),
    RentController: Symbol.for('RentController'),
    DelivererController: Symbol.for('DelivererController'),

    // Others
    Storage: Symbol.for('Storage'),

    // Middlewares
    AuthMiddleware: Symbol.for('AuthMiddleware'),
}

export { TYPES }

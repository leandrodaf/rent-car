export interface IRentalPlan {
    days: number
    dailyRate: number
}

export interface IRentPlanRepository {
    findBy(daysRequested: number): IRentalPlan | undefined
}

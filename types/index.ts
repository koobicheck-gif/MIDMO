export type {
  User,
  Customer,
  Dumpster,
  Job,
  Invoice,
  Payment,
  DispatchRoute,
  Role,
  CustomerType,
  PaymentMethod,
  DumpsterStatus,
  JobType,
  JobStatus,
  InvoiceStatus,
} from '@prisma/client'

import type { Customer, Dumpster, Job, Invoice, Payment, User } from '@prisma/client'

export type DumpsterWithJob = Dumpster & {
  jobs: (Job & { customer: Customer | null })[]
}

export type JobWithRelations = Job & {
  customer: Customer
  dumpster: Dumpster | null
  driver: User | null
  invoice: Invoice | null
}

export type InvoiceWithRelations = Invoice & {
  customer: Customer
  job: Job | null
  payments: Payment[]
}

export type CustomerWithStats = Customer & {
  jobs: Job[]
  invoices: Invoice[]
  _count: {
    jobs: number
    invoices: number
  }
}

export interface NavItem {
  label: string
  href: string
  icon: string
  roles?: string[]
}

export interface WeatherData {
  temperature: number
  weathercode: number
  description: string
  icon: string
  city: string
}

export interface DashboardStats {
  activeUnits: number
  totalCustomers: number
  monthlyRevenue: number
  outstandingInvoices: number
  todayJobs: number
  overdueUnits: number
  dueUnits: number
}

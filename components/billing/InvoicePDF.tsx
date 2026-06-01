import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { format } from 'date-fns'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  company: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#15803d',
  },
  companyDetails: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
  },
  invoiceTitle: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#1f2937',
    textAlign: 'right',
  },
  invoiceNumber: {
    fontSize: 11,
    color: '#15803d',
    fontFamily: 'Helvetica-Bold',
    textAlign: 'right',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  customerName: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#1f2937',
  },
  customerDetail: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: '8 12',
    borderRadius: 4,
  },
  tableHeaderText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#6b7280',
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    padding: '8 12',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tableCell: {
    fontSize: 10,
    color: '#374151',
    flex: 1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#15803d',
  },
  totalLabel: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#1f2937',
    marginRight: 20,
  },
  totalAmount: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#15803d',
  },
  footer: {
    marginTop: 40,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    fontSize: 9,
    color: '#9ca3af',
    textAlign: 'center',
  },
})

interface Invoice {
  invoiceNumber: string
  total: number
  baseRate: number
  extraDays: number
  dayRate: number
  lateFee: number
  fuelSurcharge: number
  dueDate: Date | string
  notes?: string | null
  customer: {
    name: string
    address: string
    city: string
    state: string
    zip: string
    phone: string
    email?: string | null
  }
}

export function InvoicePDF({ invoice }: { invoice: Invoice }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.company}>Mid Mo Roll Offs</Text>
            <Text style={styles.companyDetails}>Columbia, MO 65201</Text>
            <Text style={styles.companyDetails}>(573) 555-0100</Text>
            <Text style={styles.companyDetails}>midmorolloffs.com</Text>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
            <Text style={[styles.companyDetails, { textAlign: 'right' }]}>
              Due: {format(new Date(invoice.dueDate), 'MMMM d, yyyy')}
            </Text>
          </View>
        </View>

        {/* Bill to */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill To</Text>
          <Text style={styles.customerName}>{invoice.customer.name}</Text>
          <Text style={styles.customerDetail}>{invoice.customer.address}</Text>
          <Text style={styles.customerDetail}>{invoice.customer.city}, {invoice.customer.state} {invoice.customer.zip}</Text>
          <Text style={styles.customerDetail}>{invoice.customer.phone}</Text>
        </View>

        {/* Line items */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 3 }]}>Description</Text>
            <Text style={[styles.tableHeaderText, { textAlign: 'right' }]}>Amount</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 3 }]}>Dumpster Rental — Base Rate</Text>
            <Text style={[styles.tableCell, { textAlign: 'right' }]}>${invoice.baseRate.toFixed(2)}</Text>
          </View>

          {invoice.extraDays > 0 && (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Extra {invoice.extraDays} days @ ${invoice.dayRate.toFixed(2)}/day</Text>
              <Text style={[styles.tableCell, { textAlign: 'right' }]}>${(invoice.extraDays * invoice.dayRate).toFixed(2)}</Text>
            </View>
          )}

          {invoice.lateFee > 0 && (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Late Fee</Text>
              <Text style={[styles.tableCell, { textAlign: 'right' }]}>${invoice.lateFee.toFixed(2)}</Text>
            </View>
          )}

          {invoice.fuelSurcharge > 0 && (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Fuel Surcharge</Text>
              <Text style={[styles.tableCell, { textAlign: 'right' }]}>${invoice.fuelSurcharge.toFixed(2)}</Text>
            </View>
          )}
        </View>

        {/* Total */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Due</Text>
          <Text style={styles.totalAmount}>${invoice.total.toFixed(2)}</Text>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={[styles.section, { marginTop: 20 }]}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={{ fontSize: 10, color: '#6b7280' }}>{invoice.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Thank you for your business! Payment is due by {format(new Date(invoice.dueDate), 'MMMM d, yyyy')}.{'\n'}
          Questions? Call (573) 555-0100 or email billing@midmorolloffs.com
        </Text>
      </Page>
    </Document>
  )
}

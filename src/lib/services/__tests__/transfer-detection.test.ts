import { describe, it, expect } from 'vitest'
import { transferDetectionService } from '../transfer-detection.service'
import { Transaction, TransactionSource } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

describe('TransferDetectionService', () => {
    const createTxn = (overrides: Partial<Transaction>): Transaction => {
        const base: Transaction = {
            id: Math.random().toString(36).substring(7),
            accountId: 'acc1',
            date: new Date('2024-01-01'),
            description: 'Test Txn',
            merchant: null,
            amount: new Decimal(0),
            categoryId: null,
            pending: false,
            source: TransactionSource.PLAID,
            plaidTransactionId: null,
            notes: null,
            isTransfer: false,
            transferId: null,
            authorizedDate: null,
            rawDescription: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        return { ...base, ...overrides } as Transaction
    }

    describe('isTransferPair', () => {
        it('should match an exact transfer pair', () => {
            const a = createTxn({ accountId: 'bank', amount: new Decimal(-100), date: new Date('2024-01-01') })
            const b = createTxn({ accountId: 'credit', amount: new Decimal(100), date: new Date('2024-01-01') })

            expect(transferDetectionService.isTransferPair(a, b)).toBe(true)
        })

        it('should match within the 4-day window', () => {
            const a = createTxn({ accountId: 'bank', amount: new Decimal(-100), date: new Date('2024-01-01') })
            const b = createTxn({ accountId: 'credit', amount: new Decimal(100), date: new Date('2024-01-05') })

            expect(transferDetectionService.isTransferPair(a, b)).toBe(true)
        })

        it('should NOT match outside the 4-day window', () => {
            const a = createTxn({ accountId: 'bank', amount: new Decimal(-100), date: new Date('2024-01-01') })
            const b = createTxn({ accountId: 'credit', amount: new Decimal(100), date: new Date('2024-01-06') })

            expect(transferDetectionService.isTransferPair(a, b)).toBe(false)
        })

        it('should NOT match same account', () => {
            const a = createTxn({ accountId: 'bank', amount: new Decimal(-100) })
            const b = createTxn({ accountId: 'bank', amount: new Decimal(100) })

            expect(transferDetectionService.isTransferPair(a, b)).toBe(false)
        })

        it('should NOT match unequal amounts', () => {
            const a = createTxn({ accountId: 'bank', amount: new Decimal(-100) })
            const b = createTxn({ accountId: 'credit', amount: new Decimal(101) })

            expect(transferDetectionService.isTransferPair(a, b)).toBe(false)
        })

        it('should NOT match two outflows', () => {
            const a = createTxn({ accountId: 'bank', amount: new Decimal(-100) })
            const b = createTxn({ accountId: 'credit', amount: new Decimal(-100) })

            expect(transferDetectionService.isTransferPair(a, b)).toBe(false)
        })
    })
})

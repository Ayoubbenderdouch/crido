import { useTranslation } from 'react-i18next'
import { FileText } from 'lucide-react'
import type { MerchantPayout } from '@/lib/mock/data'
import type { PayoutBankDetails } from '@/lib/payoutBankDetails'
import type { PayoutProofFile } from './PayoutProofUpload'
import { PayoutProofPreview } from './PayoutProofPreview'
import type { Locale } from '@/lib/format'

type Props = {
  payout: MerchantPayout
  bankDetails: PayoutBankDetails
  locale: Locale
  transferRef?: string | null
  uploaded?: PayoutProofFile | null
}

export function PayoutProofDisplay({
  payout,
  bankDetails,
  locale,
  transferRef,
  uploaded,
}: Props) {
  const { t } = useTranslation()

  if (uploaded) {
    const isPdf = uploaded.mimeType === 'application/pdf'
    return (
      <div className="p-4">
        <p className="mb-3 text-center text-xs font-medium text-primary">
          {t('payouts.upload.uploadedLabel')}
        </p>
        {isPdf ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-background py-10">
            <FileText size={48} className="text-primary" />
            <p className="text-sm font-medium">{uploaded.fileName}</p>
            <a
              href={uploaded.dataUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-fg hover:bg-primary/90"
            >
              {t('payouts.upload.openPdf')}
            </a>
          </div>
        ) : (
          <a href={uploaded.dataUrl} target="_blank" rel="noreferrer" className="block">
            <img
              src={uploaded.dataUrl}
              alt=""
              className="mx-auto max-h-[420px] w-full rounded-xl border border-border object-contain shadow-sm"
            />
          </a>
        )}
        <p className="mt-2 text-center text-xs text-foreground-tertiary">{uploaded.fileName}</p>
      </div>
    )
  }

  return (
    <PayoutProofPreview
      payout={payout}
      bankDetails={bankDetails}
      locale={locale}
      transferRef={transferRef}
    />
  )
}

import { getAvailableSlots } from '@/app/actions/slots'
import AvailableSlots from '@/components/book/AvailableSlots'

const Book = async () => {
    const businessId = process.env.NEXT_PUBLIC_BUSINESS_ID
    const d = new Date()
    d.setDate(d.getDate()-1)
    
    const availableSlots: string[] = await getAvailableSlots(businessId!, d.toISOString().split("T")[0])

    return (
        <div>
            <AvailableSlots slots={availableSlots} />
        </div>
    )
}

export default Book
import { getAvailableSlots } from '@/lib/actions/slots'
import BookingForm from '@/components/book/BookingForm'

const Book = async () => {
    
    const businessId = process.env.NEXT_PUBLIC_BUSINESS_ID
    if (!businessId) {
        throw new Error("Missing NEXT_PUBLIC_BUSINESS_ID")
    }

    const d = new Date()

    console.log("from booking page", d)
    
    const availableSlots: string[] = await getAvailableSlots(businessId!, d.toISOString().split("T")[0])

    console.log("--------------------------")
    console.log(availableSlots)
    console.log("--------------------------")

    return (
        <div>
            <BookingForm initialSlots={availableSlots} initialDate={d} businessId={businessId} />
        </div>
    )
}

export default Book
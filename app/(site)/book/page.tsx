import { getAvailableSlots } from '@/lib/actions/slots'
import BookingForm from '@/components/book/BookingForm'
import { getCurrentBusiness } from '@/lib/business/getCurrentBusiness'

const Book = async () => {
    const {business} = await getCurrentBusiness()

    const businessId = business?.id
    if (!businessId) {
        throw new Error("Missing business ID")
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
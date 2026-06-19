import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { getCurrentBusiness } from "@/lib/business/getCurrentBusiness"
import { Mail, Phone, MapPin, Globe } from "lucide-react"
import React from "react"

export default async function ContactPage() {
  const { business, settings } = await getCurrentBusiness()

  if (!business) {
    throw new Error("Business not found, cannot load contact page")
  }

  // Define contact information rows dynamically
  const contactInfo = [
    {
      icon: <Mail className="size-5 text-highlight" />,
      label: "E-post",
      value: business.email,
      href: `mailto:${business.email}`,
    },
    {
      icon: <Phone className="size-5 text-highlight" />,
      label: "Telefon",
      value: business.phone || "Inget telefonnummer angivet",
      href: business.phone ? `tel:${business.phone}` : undefined,
    },
    {
      icon: <MapPin className="size-5 text-highlight" />,
      label: "Adress",
      value: business.address || "Ingen adress angiven",
      href: business.address 
        ? `https://maps.google.com/?q=${encodeURIComponent(business.address)}` 
        : undefined,
    },
  ]

  // Filter available social links out dynamically using the reliable Globe icon for web links
  const socials = [
    { icon: <Globe className="size-5" />, url: settings?.instagram_url, name: "Instagram" },
    { icon: <Globe className="size-5" />, url: settings?.facebook_url, name: "Facebook" },
  ].filter(social => social.url)

  return (
    // Increased max-w-5xl to max-w-6xl and py-20 to py-28 to open up the page width and vertical breathing room
    <main className="max-w-6xl mx-auto px-8 py-28">
      {/* Background radial glow */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-background to-black/5" />

      {/* HERO HEADER */}
      <section className="text-center mb-24">
        <div className="inline-block px-4 py-1.5 rounded-full bg-highlight/10 text-highlight text-sm mb-6 font-medium tracking-wide">
          {business.name}
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight pt-2">
          Kontakta oss
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Har du några frågor, speciella önskemål eller vill du boka ett större sällskap? Hör av dig till oss!
        </p>
      </section>

      {/* MAIN TWO-COLUMN CONTENT GRID */}
      {/* Increased the column gap from gap-10 to gap-16 to spread elements out on large screens */}
      <div className="grid gap-16 lg:grid-cols-5 items-start">
        
        {/* COLUMN 1: DIRECT CONTACT DETAILS (2/5 Cols) */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-3">Kontaktuppgifter</h2>
            <p className="text-muted-foreground leading-relaxed">
              Du är alltid välkommen att ringa eller skicka ett mail, vi svarar så fort vi kan.
            </p>
          </div>

          <div className="space-y-4">
            {contactInfo.map((info, index) => {
              const Wrapper = info.href ? "a" : "div"
              return (
                <Card key={index} className="border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <Wrapper 
                      href={info.href}
                      target={info.href?.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className={cn(
                        "flex items-center gap-5 text-left",
                        info.href && "group transition-colors hover:opacity-80"
                      )}
                    >
                      <div className="p-3 rounded-xl bg-highlight/10 shrink-0">
                        {info.icon}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          {info.label}
                        </p>
                        <p className="text-base font-medium text-foreground mt-0.5 break-all">
                          {info.value}
                        </p>
                      </div>
                    </Wrapper>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* SOCIAL MEDIA SUB-SECTION */}
          {socials.length > 0 && (
            <div className="pt-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
                Följ oss i sociala medier
              </p>
              <div className="flex gap-4">
                {socials.map((social, idx) => (
                  <a
                    key={idx}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-3 rounded-xl border bg-card text-muted-foreground hover:text-highlight hover:border-highlight/40 transition-all shadow-sm font-medium text-sm"
                  >
                    {social.icon}
                    <span>{social.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* COLUMN 2: INTERACTIVE EMAIL FORM (3/5 Cols) */}
        <Card className="lg:col-span-3 border bg-card shadow-md">
          <CardContent className="p-8 md:p-10 space-y-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-3">Skicka ett meddelande</h2>
              <p className="text-muted-foreground leading-relaxed">
                Fyll i formuläret nedan så återkommer vi till dig via e-post.
              </p>
            </div>

            <form className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Namn</label>
                  {/* Added h-12 and px-4 for a premium, spacious input look */}
                  <Input type="text" placeholder="Ditt fullständiga namn" className="bg-background h-12 px-4 text-base shadow-sm focus-visible:ring-highlight" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">E-postadress</label>
                  <Input type="email" placeholder="namn@exempel.se" className="bg-background h-12 px-4 text-base shadow-sm focus-visible:ring-highlight" required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ämne</label>
                <Input type="text" placeholder="Vad gäller ditt ärende?" className="bg-background h-12 px-4 text-base shadow-sm focus-visible:ring-highlight" required />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Meddelande</label>
                {/* Added p-4 for breathing room inside the textarea */}
                <Textarea 
                  placeholder="Skriv ditt meddelande här..." 
                  className="min-h-[160px] bg-background p-4 text-base shadow-sm focus-visible:ring-highlight resize-none leading-relaxed" 
                  required 
                />
              </div>

              <Button type="submit" className="w-full sm:w-auto px-8 py-6 bg-primary hover:bg-primary/90 text-base transition-all font-semibold rounded-xl shadow-md hover:shadow-lg">
                Skicka meddelande
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>
    </main>
  )
}

// Inline helper fallback to secure string utility joining operations if not imported
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ")
}
"use client"

import React, { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useStaffUser } from "../providers/StaffUserProvider"
import type { Message } from "@/lib/types"

import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"

import {
  MessageSquare,
  Mail,
  User,
  Clock,
  RefreshCcw,
  Reply,
} from "lucide-react"

function formatDate(date: string) {
  return new Date(date).toLocaleString("sv-SE", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const Messages = () => {
  const supabase = createClient()
  const user = useStaffUser()

  const [messages, setMessages] = useState<Message[]>([])
  const [openId, setOpenId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchMessages = async () => {
    if (!user?.business_id) return

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("business_id", user.business_id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setMessages(data ?? [])
  }

  const refresh = async () => {
    setRefreshing(true)
    await fetchMessages()
    setRefreshing(false)
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await fetchMessages()
      setLoading(false)
    }

    if (user?.business_id) init()
  }, [user?.business_id])

  const replyTo = (email: string, subject: string) => {
    const encodedSubject = encodeURIComponent(`Re: ${subject}`)
    const encodedBody = encodeURIComponent(
      `Hej,\n\nTack för ditt meddelande.\n\n`
    )

    // Gmail fallback (works everywhere)
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodedSubject}&body=${encodedBody}`

    window.open(gmailUrl, "_blank")
  }

  if (loading) {
    return (
      <div className="p-6 text-muted-foreground">
        Laddar meddelanden...
      </div>
    )
  }

  return (
    <div className="space-y-5 p-2">

      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Meddelanden
          </h1>
          <p className="text-sm text-muted-foreground">
            Inkommande kundförfrågningar
          </p>
        </div>

        <Button
          variant="outline"
          onClick={refresh}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCcw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Uppdatera
        </Button>

      </div>

      {/* EMPTY */}
      {messages.length === 0 && (
        <Card className="border-muted/40">
          <CardContent className="p-10 text-center text-muted-foreground">
            Inga meddelanden än
          </CardContent>
        </Card>
      )}

      {/* LIST */}
      <div className="space-y-3">
        {messages.map((msg, index) => {
          const isOpen = openId === msg.id

          // soft alternating tint (feels alive but still neutral)
          const tint =
            index % 3 === 0
              ? "border-blue-500/20"
              : index % 3 === 1
              ? "border-emerald-500/20"
              : "border-violet-500/20"

          return (
            <Card
              key={msg.id}
              className={`
                border-muted/40
                ${tint}
                transition-all
                hover:shadow-md
                hover:-translate-y-[1px]
              `}
            >
              <CardContent className="p-5 space-y-4">

                {/* TOP */}
                <div className="flex items-start justify-between gap-4">

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{msg.name}</p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span>{msg.email}</span>
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    <Badge variant="secondary" className="text-xs">
                      {msg.subject}
                    </Badge>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(msg.created_at)}</span>
                    </div>
                  </div>

                </div>

                {/* PREVIEW */}
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {msg.message}
                </p>

                {/* ACTIONS */}
                <div className="flex items-center gap-2 pt-2">

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setOpenId(isOpen ? null : msg.id)
                    }
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {isOpen ? "Stäng" : "Läs"}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => replyTo(msg.email, msg.subject)}
                    className="gap-2"
                  >
                    <Reply className="h-4 w-4" />
                    Svara
                  </Button>

                </div>

                {/* EXPANDED */}
                {isOpen && (
                  <div className="rounded-xl border border-muted/40 bg-muted/20 p-4 text-sm whitespace-pre-wrap leading-relaxed">
                    {msg.message}
                  </div>
                )}

              </CardContent>
            </Card>
          )
        })}
      </div>

    </div>
  )
}

export default Messages
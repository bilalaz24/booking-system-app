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

    const mailto = `mailto:${email}?subject=${encodedSubject}?body=${encodedBody}`

    window.location.href = mailto
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
          disabled={refreshing || loading}
          className="gap-2"
        >
          <RefreshCcw
            className={`h-4 w-4 ${refreshing || loading ? "animate-spin" : ""}`}
          />
          Uppdatera
        </Button>
      </div>

      {/* LOADING STATE (SKELETON CARDS) */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-muted/40 animate-pulse">
              <CardContent className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 w-1/3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                  <div className="space-y-2 w-1/4 flex flex-col items-end">
                    <div className="h-5 bg-muted rounded-full w-20" />
                    <div className="h-3 bg-muted rounded w-16" />
                  </div>
                </div>
                <div className="space-y-2 pt-1">
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-5/6" />
                </div>
                <div className="flex gap-2 pt-2">
                  <div className="h-8 bg-muted rounded-md w-16" />
                  <div className="h-8 bg-muted rounded-md w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
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
              );
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default Messages
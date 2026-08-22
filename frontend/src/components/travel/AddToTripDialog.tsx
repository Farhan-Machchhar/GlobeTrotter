import { useEffect, useState } from "react"
import { Plus, Check } from "lucide-react"
import { useNavigate } from "react-router-dom"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { getTrips } from "@/services/tripService"
import { apiClient } from "@/services/api"
import type { Trip } from "@/types/trip"

interface AddToTripDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    itemName: string
    itemType?: "destination" | "activity"
}

export function AddToTripDialog({
    open,
    onOpenChange,
    itemName,
    itemType = "destination",
}: AddToTripDialogProps) {
    const [trips, setTrips] = useState<Trip[]>([])
    const [loadingTrips, setLoadingTrips] = useState(false)
    const [selectedTrip, setSelectedTrip] = useState<string>("")
    const [added, setAdded] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        if (!open) return
        async function fetchTrips() {
            setLoadingTrips(true)
            try {
                const userTrips = await getTrips()
                setTrips(userTrips)
                if (userTrips.length > 0) {
                    setSelectedTrip(userTrips[0].id)
                }
            } catch (err) {
                console.error("Error fetching trips for dialog:", err)
            } finally {
                setLoadingTrips(false)
            }
        }
        fetchTrips()
    }, [open])

    const handleAdd = async () => {
        if (!selectedTrip || !itemName) return

        try {
            if (itemType === "destination") {
                await apiClient.post(`/trips/${selectedTrip}/stops`, {
                    city_name: itemName,
                })
            } else {
                await apiClient.post(`/trips/${selectedTrip}/stops`, {
                    city_name: itemName,
                    notes: `Activity: ${itemName}`,
                })
            }
            setAdded(true)
            setTimeout(() => {
                onOpenChange(false)
                setAdded(false)
                setSelectedTrip("")
            }, 900)
        } catch (err) {
            console.error("Failed to add to trip:", err)
            setAdded(true)
            setTimeout(() => {
                onOpenChange(false)
                setAdded(false)
            }, 900)
        }
    }

    const handleCreateTrip = () => {
        onOpenChange(false)
        navigate("/create-trip")
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[calc(100%-2rem)] max-w-md">
                <DialogHeader>
                    <DialogTitle>Add to trip</DialogTitle>
                    <DialogDescription>
                        Add {itemType === "activity" ? "this activity" : "this destination"}{" "}
                        to one of your trips.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                    <div className="rounded-lg bg-muted/50 px-4 py-3">
                        <p className="text-sm font-medium">{itemName}</p>
                    </div>

                    <p className="text-sm font-medium">Your trips</p>

                    {loadingTrips ? (
                        <p className="text-xs text-muted-foreground py-2">Loading trips...</p>
                    ) : trips.length === 0 ? (
                        <div className="text-center py-4 text-sm text-muted-foreground">
                            No trips found. Create your first trip!
                        </div>
                    ) : (
                        <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                            {trips.map((trip) => {
                                const selected = selectedTrip === trip.id
                                const tripName = trip.name || trip.title || "Untitled Trip"
                                const dates = `${trip.start_date || trip.startDate || 'Flexible'} — ${trip.end_date || trip.endDate || 'Flexible'}`

                                return (
                                    <button
                                        key={trip.id}
                                        type="button"
                                        onClick={() => setSelectedTrip(trip.id)}
                                        className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${selected
                                                ? "border-primary bg-primary/5"
                                                : "hover:bg-muted/50"
                                            }`}
                                    >
                                        <div
                                            className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${selected
                                                    ? "border-primary bg-primary text-primary-foreground"
                                                    : "border-muted-foreground/40"
                                                }`}
                                        >
                                            {selected && <Check className="size-3" />}
                                        </div>

                                        <div className="overflow-hidden">
                                            <p className="text-sm font-medium truncate">{tripName}</p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {dates}
                                            </p>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    )}

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start"
                        onClick={handleCreateTrip}
                    >
                        <Plus className="mr-2 size-4" />
                        Create new trip
                    </Button>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>

                    <Button
                        disabled={!selectedTrip || added}
                        onClick={handleAdd}
                    >
                        {added ? (
                            <>
                                <Check className="mr-2 size-4" />
                                Added
                            </>
                        ) : (
                            "Add to Trip"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

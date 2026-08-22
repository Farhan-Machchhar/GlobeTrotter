import { useState } from "react"
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

interface Trip {
    id: string
    name: string
    dates: string
}

interface AddToTripDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    itemName: string
    itemType?: "destination" | "activity"
}

const mockTrips: Trip[] = [
    {
        id: "1",
        name: "Japan Adventure",
        dates: "Aug 24 – Aug 30",
    },
    {
        id: "2",
        name: "Tokyo Explorer",
        dates: "Sep 10 – Sep 15",
    },
    {
        id: "3",
        name: "Asia Summer Trip",
        dates: "Oct 02 – Oct 12",
    },
]

export function AddToTripDialog({
    open,
    onOpenChange,
    itemName,
    itemType = "destination",
}: AddToTripDialogProps) {
    const [selectedTrip, setSelectedTrip] = useState<string>("")
    const [added, setAdded] = useState(false)
    const navigate = useNavigate()

    const handleAdd = () => {
        if (!selectedTrip) return

        setAdded(true)

        setTimeout(() => {
            onOpenChange(false)
            setAdded(false)
            setSelectedTrip("")
        }, 900)
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

                    <div className="space-y-2">
                        {mockTrips.map((trip) => {
                            const selected = selectedTrip === trip.id

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

                                    <div>
                                        <p className="text-sm font-medium">{trip.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {trip.dates}
                                        </p>
                                    </div>
                                </button>
                            )
                        })}
                    </div>

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

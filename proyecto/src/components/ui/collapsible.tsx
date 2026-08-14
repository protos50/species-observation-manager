"use client"

import * as React from "react"
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

function Collapsible({
  id,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root> & {
  id?: string
}) {
  // Use useId to generate a stable ID if none provided
  const generatedId = React.useId()
  const collapsibleId = id || generatedId.replace(/:/g, "")
  
  return (
    <CollapsiblePrimitive.Root 
      id={collapsibleId}
      data-slot="collapsible" 
      {...props} 
    />
  )
}

function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      suppressHydrationWarning
      {...props}
    />
  )
}

function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      suppressHydrationWarning
      {...props}
    />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }

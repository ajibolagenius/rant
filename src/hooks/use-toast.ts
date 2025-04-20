import { useState, useEffect } from 'react'
import { colors } from '@/utils/colors'

// Toast display duration
const TOAST_REMOVE_DELAY = 5000

export type ToastVariant = 'default' | 'success' | 'error' | 'info'

export type ToastProps = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: ToastVariant
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

type ToastActionType = {
  type: 'ADD_TOAST'
  toast: ToastProps
} | {
  type: 'UPDATE_TOAST'
  toast: Partial<ToastProps> & { id: string }
} | {
  type: 'DISMISS_TOAST'
  toastId?: string
} | {
  type: 'REMOVE_TOAST'
  toastId?: string
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function generateId() {
  return `toast-${count++}`
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

type State = {
  toasts: ToastProps[]
}

let memoryState: State = { toasts: [] }

let listeners: ((state: State) => void)[] = []

function dispatch(action: ToastActionType) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

function reducer(state: State, action: ToastActionType): State {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [...state.toasts, action.toast],
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // If no toastId is provided, dismiss all toasts
      if (toastId === undefined) {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })

        return {
          ...state,
          toasts: state.toasts.map((t) => ({
            ...t,
            open: false,
          })),
        }
      }

      // Otherwise dismiss just the specified toast
      addToRemoveQueue(toastId)

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }

    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

export function useToast() {
  const [state, setState] = useState<State>(memoryState)

  useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast: (props: Omit<ToastProps, "id">) => {
      const id = generateId()

      // Apply default variant styling if not specified
      const variant = props.variant || 'default'

      const toast = {
        ...props,
        id,
        variant,
        open: true,
        onOpenChange: (open: boolean) => {
          if (!open) dispatch({ type: "DISMISS_TOAST", toastId: id })
        },
      }

      dispatch({
        type: "ADD_TOAST",
        toast,
      })

      return id
    },
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
    remove: (toastId?: string) => dispatch({ type: "REMOVE_TOAST", toastId }),
  }
}

// Singleton instance for importing directly
const toast = {
  default: (props: Omit<ToastProps, "id" | "variant">) => {
    const { toast } = useToast()
    return toast({ ...props, variant: "default" })
  },
  success: (props: Omit<ToastProps, "id" | "variant">) => {
    const { toast } = useToast()
    return toast({ ...props, variant: "success" })
  },
  error: (props: Omit<ToastProps, "id" | "variant">) => {
    const { toast } = useToast()
    return toast({ ...props, variant: "error" })
  },
  info: (props: Omit<ToastProps, "id" | "variant">) => {
    const { toast } = useToast()
    return toast({ ...props, variant: "info" })
  },
  dismiss: (toastId?: string) => {
    dispatch({ type: "DISMISS_TOAST", toastId })
  },
  remove: (toastId?: string) => {
    dispatch({ type: "REMOVE_TOAST", toastId })
  }
}

export { toast }

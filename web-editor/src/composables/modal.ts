import type { Component } from 'vue'
import { computed, ref, shallowRef, watchEffect } from 'vue'

type ModalContent = Component | string | null

export type ModalConfig = {
  confirm?: boolean
  cover?: boolean
  position?: [number, number]
}

const defaultConfig: ModalConfig = {
  confirm: false,
  cover: true,
}

const modalConfig = ref<ModalConfig>({ ...defaultConfig })

const modalContent = shallowRef<ModalContent>(null)
const confirm = ref<boolean | null>(null)
const content = computed(() => modalContent.value)

export const useModal = () => {
  const setModalContent = async (
    newContent: ModalContent,
    config: ModalConfig = defaultConfig,
  ): Promise<boolean> => {
    modalConfig.value = { ...defaultConfig, ...config }

    modalContent.value = newContent

    if (modalConfig.value.confirm) {
      let resolveConfirm: (value: boolean | PromiseLike<boolean>) => void

      const confirmPromise = new Promise<boolean>((resolve) => {
        resolveConfirm = resolve
      })

      const watchStop = watchEffect(() => {
        if (confirm.value != null) {
          watchStop()

          const result = confirm.value

          confirm.value = null

          resolveConfirm(result)
        }
      })

      return await confirmPromise
    }

    return false
  }

  return { content, setModalContent }
}

export const useModalContainer = () => {
  return {
    closeModal: (confirmState: boolean) => {
      confirm.value = confirmState
      modalContent.value = null
    },
    content,
    modalConfig,
  }
}

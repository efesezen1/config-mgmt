import $http from "../api/axios.js";
import {auth} from "../config/firebase.js";

class LockManager {
    constructor(initToast) {
        this.initToast = initToast
    }

    test(parameter) {
        console.log(parameter)
        this.initToast('success', 'Class active.')
    }

    async lock(parameter, action) {
        try {
            await $http.put(`/parameters/${parameter.id}/lock`)
            this.initToast(
                'success',
                action === 'edit'
                    ? 'Parameter locked successfully, you can edit now.'
                    : 'Parameter locked successfully, confirm deletion.'
            )

            // Lock successful
        } catch (error) {
            console.error('Error locking parameter:', error)
            this.initToast('error', 'Failed to lock parameter')
            throw error // Re-throw to prevent editing in table view
        }
    }

    async unlock(parameter) {
        if (!parameter || !parameter.id) return

        try {
            await $http.put(`/parameters/${parameter.id}/unlock`)
            console.log('Parameter unlocked.')
        } catch (error) {
            console.error('Error unlocking parameter:', error)
            this.initToast('error', 'Failed to unlock parameter')
        }
    }

    isLocked(parameter) {
        if (!parameter || !parameter.isLocked) return false
        return parameter.isLocked && parameter.lockedBy !== auth.currentUser?.uid
    }
}

export {LockManager}
import { createRouter, createWebHistory } from 'vue-router'
import EventListView from '../views/EventListView.vue'
import EventDetailView from '@/views/event/DetailView.vue'
import EventRegisterView from '@/views/event/RegisterView.vue'
import EventEditView from '@/views/event/EditView.vue'
import EventLayoutView from '@/views/event/LayoutView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import NetworkErrorView from '@/views/NetworkErrorView.vue'
import nProgress from 'nprogress'
import eventService from '@/services/EventService'
import { useEventStore } from '@/stores/event'
import express from 'express'
import cors from 'cors'
import { uploadFile } from './services/uploadFileService'

const app = express()

const allowedOrigins = ['http://localhost:5173', 'https://713-2025-frontend.vercel.app']

const options: cors.CorsOptions = {
  origin: allowedOrigins
}

app.use(cors(options))

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'event-list-view',
      component: EventListView,
      props: (route) => ({
        page: parseInt(route.query.page as string) || 1,
      }),
    },
    {
      path: '/event/:id',
      name: 'event-layout-view',
      component: EventLayoutView,
      props: true,
      children: [
        {
          path: '',
          name: 'event-detail-view',
          component: EventDetailView,
        },
        {
          path: 'register',
          name: 'event-register-view',
          component: EventRegisterView,
        },
        {
          path: 'edit',
          name: 'event-edit-view',
          component: EventEditView,
        },
      ],
      beforeEnter: (to, from, next) => {
        const eventStore = useEventStore()
        const eventId = Number(to.params.id)
        if (!isNaN(eventId)) {
          eventService.getEvent(eventId)
            .then((response) => {
              eventStore.setEvent(response.data)
              next()
            })
            .catch((error) => {
              if (error.response && error.response.status == 404) {
                next({ name: '404', params: { resource: 'event' } })
              } else {
                next({ name: 'network-error' })
              }
            })
        } else {
          next({ name: '404', params: { resource: 'event' } })
        }
      },
    },
    {
      path: '/404',
      name: '404',
      component: NotFoundView,
      props: true,
    },
    {
      path: '/network-error',
      name: 'network-error',
      component: NetworkErrorView,
    },
    {
      path: '/:catchAll(.*)',
      redirect: { name: '404', params: { resource: 'page' } },
    },
  ],
})

router.beforeEach(() => {
  nProgress.start()
})

router.afterEach(() => {
  nProgress.done()
})

app.listen(3000, () => {
  console.log('Server is running on port 3000')
})

export default router
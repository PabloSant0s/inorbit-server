import fastify from 'fastify'
import {
  type ZodTypeProvider,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import z from 'zod'

import { env } from '../env'
import { createGoal } from '../services/create-goal'
import { createGoalCompletion } from '../services/create-goal-completion'
import { getWeekPendingGoals } from '../services/get-week-pending-goals'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.get('/pending-goals', async (req, rep) => {
  const { pendingGoals } = await getWeekPendingGoals()

  return { pendingGoals }
})

app.post(
  '/goals',
  {
    schema: {
      body: z.object({
        title: z.string(),
        desiredWeeklyFrequency: z.number().min(1).max(7),
      }),
    },
  },
  async (request, reply) => {
    const { title, desiredWeeklyFrequency } = request.body

    const result = await createGoal({
      title,
      desiredWeeklyFrequency,
    })

    reply.status(201).send(result)
  }
)
app.post(
  '/completion',
  {
    schema: {
      body: z.object({
        goalId: z.string(),
      }),
    },
  },
  async (request, reply) => {
    const { goalId } = request.body

    const { goalCompletion } = await createGoalCompletion({
      goalId,
    })

    reply.status(201).send({ goalCompletion })
  }
)

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('Server running')
  })

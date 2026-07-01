# Fix Backend: sendLoginCode Throttler Error

## Erreur actuelle

```
Cannot read properties of undefined (reading 'ip')
at ThrottlerGuard.getTracker
```

## Cause

Le `ThrottlerGuard` de NestJS essaie de lire `context.ip` dans un contexte GraphQL, mais le contexte HTTP n'est pas correctement mappé.

## Solution

### Option 1: Custom Throttler Guard pour GraphQL

Créer un guard custom qui sait extraire l'IP depuis le context GraphQL:

```typescript
// src/common/guards/graphql-throttler.guard.ts
import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class GraphqlThrottlerGuard extends ThrottlerGuard {
  getRequestResponse(context: ExecutionContext) {
    const gqlCtx = GqlExecutionContext.create(context);
    const ctx = gqlCtx.getContext();
    return { req: ctx.req, res: ctx.res };
  }
}
```

Utiliser ce guard dans le resolver:

```typescript
// auth.resolver.ts
import { UseGuards } from '@nestjs/common';
import { GraphqlThrottlerGuard } from '../common/guards/graphql-throttler.guard';

@Mutation(() => Boolean)
@UseGuards(GraphqlThrottlerGuard)
async sendLoginCode(
  @Args('email') email: string,
  @Context() context: any,
): Promise<boolean> {
  // ...
}
```

### Option 2: Configurer le context GraphQL globalement

Dans `app.module.ts`:

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: true,
  context: ({ req, res }) => ({ req, res }), // <-- Ajouter ceci
}),
```

### Option 3: Désactiver temporairement le throttle pour sendLoginCode

Si le throttling n'est pas critique pour cette mutation:

```typescript
@SkipThrottle() // <-- Ajouter cet decorator
@Mutation(() => Boolean)
async sendLoginCode(@Args('email') email: string): Promise<boolean> {
  // ...
}
```

## Recommandation

Utiliser **Option 1** (Custom Guard) pour garder la protection throttle tout en supportant GraphQL correctement.

## Test

Après la fix, tester avec:

```graphql
mutation {
  sendLoginCode(email: "test@example.com")
}
```

Le code devrait être envoyé sans erreur 500.

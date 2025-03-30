<script lang="ts">
  let firstName: string = '';
  let lastName: string = '';
  let email: string = '';
  let admin = false;
  let handle: string;
  let roles: Array<string> = [];

</script>

<h1>Invite new user</h1>

<div>
  <input
    data-testid="firstName"
    aria-label="First name"
    type="text"
    placeholder="Fornavn"
    bind:value={firstName}
    required
  />

  <input
    data-testid="lastName"
    aria-label="First name"
    type="text"
    placeholder="Etternavn"
    bind:value={lastName}
    required
  />

  <input
    data-testid="email"
    aria-label="Email"
    type="text"
    placeholder="Email"
    bind:value={email}
    required
  />

  <input
    data-testid="handle"
    aria-label="Handle"
    type="text"
    placeholder="Handle"
    bind:value={handle}
    required
  />

  <input
    data-testid="admin"
    aria-label="Is Admin"
    bind:value={admin}
    type="checkbox"
    required
  />
</div>

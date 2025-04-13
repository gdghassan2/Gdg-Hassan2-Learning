<script lang="ts">
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let available = false;
	let subdomain = '';
	let username = '';
	let loading = false;
	let debounceTimeout: ReturnType<typeof setTimeout>;

	export let form: ActionData;

	async function logout() {
		const res = await fetch('/api/logout', { method: 'POST' });
		if (res.ok) {
			location.href = '/login';
		} else {
			console.error('Logout failed');
		}
	}

	async function checkDnsAvailability() {
		if (subdomain == '') return (available = false);
		loading = true;
		const res = await fetch('/api/recordAvailablity', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ subdomain })
		});
		const data = (await res.json()) as { available: boolean };
		available = data.available;
		loading = false;
	}

	async function checkUsernameAvailability() {
		if (username == '') return (available = false);
		loading = true;
		const res = await fetch('/api/usernameAvailablity', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ username })
		});
		const data = (await res.json()) as { available: boolean };
		available = data.available;
		loading = false;
	}

	function handleInput(funtionIndex: number) {
		clearTimeout(debounceTimeout);
		if (funtionIndex == 0) {
			debounceTimeout = setTimeout(() => {
				checkDnsAvailability();
			}, 300);
		} else {
			debounceTimeout = setTimeout(() => {
				checkUsernameAvailability();
			}, 300);
		}
	}
</script>

<main>
	<div class="flex justify-between p-6">
		<h2 class="h2 font-semibold">
			Hello, <b>{$page.data.firstName ?? $page.data.username ?? 'Not Set'}</b>
		</h2>
		<button type="button" class="variant-filled btn w-1/4 md:w-[8em]" on:click={logout}>
			logout
		</button>
	</div>

	{#if $page.data.username}
		<!-- First message to the user -->
		<div class="flex h-full w-full items-center justify-center pt-14">
			<div class="flex w-full flex-col items-center gap-6">
				<h2 class="h2 mb-6">let's configure your web hosting</h2>
				<!-- dns record step -->
				{#if $page.data.onboardingStep == 0}
					<!-- active version of the section -->
					<div class="card flex w-3/4">
						<form
							class="flex w-full flex-col space-y-4 p-6"
							method="POST"
							action="?/createDnsRecord"
							use:enhance
						>
							<h3 class="h3 mb-4">Choose your subdomain extension</h3>
							<div class="flex flex-col gap-4 md:flex-row">
								<div class="flex flex-1 flex-row gap-4">
									<input
										class="input p-2"
										type="text"
										name="subdomain"
										id="subdomain"
										placeholder="Enter your subdomain"
										on:input={()=>handleInput(0)}
										bind:value={subdomain}
									/>
									<!-- availability icon -->
									<div class="mx-4 flex items-center md:mr-10">
										{#if loading}
											<div
												class="spinner-border h-6 w-6 animate-spin rounded-full border-4 border-blue-500 border-r-transparent"
											></div>
										{:else if available}
											<svg
												class="h-6 w-6 text-green-500"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M5 13l4 4L19 7"
												></path>
											</svg>
										{:else}
											<svg
												class="h-6 w-6 text-red-400"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M6 18L18 6M6 6l12 12"
												></path>
											</svg>
										{/if}
									</div>
								</div>
								<button class="variant-filled btn whitespace-nowrap" disabled={loading}>
									Create
								</button>
							</div>
							{#if form?.message}
								<p class="text-sm">{form.message}</p>
							{/if}
						</form>
					</div>
				{:else}
					<!-- disabled version of the section -->
					<div class="card flex w-3/4">
						<div class="flex w-full items-center justify-between">
							<h3 class="h3 m-4 text-gray-400">1 - Choose your subdomain extension</h3>
							<h4>{$page.data.subdomain}</h4>
							<svg
								class="mr-16 h-8 w-8 text-green-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								></path>
							</svg>
						</div>
					</div>
				{/if}
				<!--account Creation Step-->
				{#if $page.data.onboardingStep == 1}
					<!-- active version of the section -->
					<div class="card flex w-3/4">
						<form
							class="flex w-full flex-col space-y-4 p-6"
							method="POST"
							action="?/createAccount"
							use:enhance
						>
							<h3 class="h3 mb-4">Create your account</h3>
							<div class="flex flex-col gap-4 md:flex-row">
								<input
									class="input p-2"
									type="text"
									name="username"
									id="username"
									placeholder="Enter your username"
									on:input={()=>handleInput(1)}
									bind:value={username}
								/>
								<input
									class="input p-2"
									type="text"
									name="firstName"
									id="firstName"
									placeholder="Enter your first name"
								/>
								<input
									class="input p-2"
									type="text"
									name="lastName"
									id="lastName"
									placeholder="Enter your last name"
								/>
								<input
									class="input p-2"
									type="text"
									name="email"
									id="email"
									placeholder="Enter your email"
								/>
								<button class="variant-filled btn whitespace-nowrap" disabled={loading}> Create </button>
							</div>
							{#if form?.message}
								<p class="text-sm">{form.message}</p>
							{/if}
						</form>
					</div>
				{:else}
					<!-- disabled version of the section -->
					<div class="card flex w-3/4">
						<div class="flex w-full items-center justify-between">
							<h3 class="h3 m-4 text-gray-400">2 - Create your account</h3>
							{#if ($page.data.onboardingStep > 1)}
							<svg
							class="mr-16 h-8 w-8 text-green-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 13l4 4L19 7"
							></path>
						</svg>
							{/if}
						</div>
					</div>
				{/if}
			</div>
		</div>
		<!-- <div class="flex">
		<form class="flex flex-col gap-4 p-4 md:w-1/4 " method="POST" use:enhance>
			<h2 class="h2">Change Info</h2>
			<input class="input p-2" type="text" name="username" id="username" value={$page.data.username}/>
			<input class="input p-2" type="text" name="firstName" id="firstName" value={$page.data.firstName}/>
			<input class="input p-2" type="text" name="lastName" id="lastName" value={$page.data.lastName}/>
			<input class="input p-2" type="text" name="email" id="email" value={$page.data.email}/>
			<button class="btn variant-filled" type="submit">Update</button>
			<p>{form?.message ?? ''}</p>
		</form>
	</div> -->
	{/if}
</main>

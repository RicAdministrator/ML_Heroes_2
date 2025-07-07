<template>
    <div v-show="activeSection === 'search'">
        <a class="link-style" @click="addClicked">Add Hero</a>
        <div class="w3-panel w3-pale-green w3-border" v-show="saveSuccessMsg || deleteSuccessMsg">
            <h3>Success!</h3>
            <p>{{ saveSuccessMsg ? saveSuccessMsg : deleteSuccessMsg }}</p>
        </div>
        <table style="margin-top: 5px;">
            <thead>
                <tr style="background-color: #2196f3;">
                    <th>Image</th>
                    <th>Name</th>
                    <th>Roles</th>
                    <th>Description</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="hero in heroes" :key="heroes.id">
                    <td>
                        <img v-bind:src="hero.image_url" alt="Avatar" style="height:150px;" />
                    </td>
                    <td>{{ hero.name }}</td>
                    <td>
                        {{hero.hero_roles.map(hr => hr.role.role).join(' / ')}}
                    </td>
                    <td>{{ hero.description }}</td>
                    <td>
                        <button class="w3-btn w3-blue"
                            @click="updateClicked(hero._id, hero.name, hero.image_url, hero.description, hero.hero_roles)">
                            Update </button>
                        &nbsp;
                        <button class=" w3-btn w3-blue" @click="deleteClicked(hero._id, hero.name)">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <div v-show="activeSection === 'upsert'">
        <div class="w3-panel w3-pale-red w3-border" v-show="saveErrors">
            <h3>Please correct the following errors:</h3>
            <p v-html="saveErrors"></p>
        </div>
        <div class="w3-card-4">
            <div class="w3-container w3-black" style="margin-bottom: 5px;">
                <h2>{{ heroId ? 'Update Hero' : 'Add Hero' }}</h2>
            </div>
            <form class="w3-container">
                <div style="margin-bottom: 20px;">
                    <label for="txtName">Name</label>
                    <input id="txtName" class="w3-input w3-border" type="text" maxlength="50" v-model="nameModel">
                </div>
                <div style="margin-bottom: 20px;">
                    <label for="txtImageURL">Image URL</label>
                    <input id="txtImageURL" class="w3-input w3-border" type="text" maxlength="150"
                        v-model="logoImageModel">
                </div>
                <div style="margin-bottom: 20px;">
                    <div ref="divRoles">
                        Roles
                        <br />
                        <div v-for="role in roles" :key="roles._id" style="float:left;">
                            <label :for="'chk' + role.role" style="margin-right:5px;">{{ role.role }}</label>
                            <input :id="'chk' + role.role" style="margin-right:35px;" class="w3-check" type="checkbox"
                                :value="role._id">
                        </div>
                    </div>
                </div>
                <div style="margin-bottom: 20px; clear:left; padding-top: 20px;">
                    <label for="txtDescription">Description</label>
                    <input id="txtDescription" class="w3-input w3-border" type="text" maxlength="150"
                        v-model="descriptionModel">
                </div>
                <div style="margin-bottom: 10px">
                    <button class="w3-btn w3-black" @click.prevent="saveClicked">Save</button>
                    <button class="w3-btn w3-black" style="margin-left:5px;"
                        @click.prevent="cancelClicked">Cancel</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            heroes: [],
            roles: [],
            activeSection: "search",

            nameModel: "",
            logoImageModel: "",
            descriptionModel: "",

            heroId: null,

            saveErrors: "",
            saveSuccessMsg: "",
            deleteSuccessMsg: "",
        };
    },
    async mounted() {
        await this.loadRoles();
        await this.loadHeroes();
    },
    methods: {
        async loadHeroes() {
            const query = `
                query GetAllHeroes {
                    heroes {
                        _id
                        name
                        image_url
                        description
                        hero_roles {
                            role {
                                _id
                                role
                            }
                        }
                    }
                }
            `;

            const response = await fetch('http://localhost:4000/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
            });
            const result = await response.json();
            this.heroes = result.data.heroes;
        },
        async loadRoles() {
            const query = `
                query {
                    roles {
                    _id
                    role
                    logo_url
                    primary_function
                    key_attributes
                    }
                }
            `;
            const response = await fetch('http://localhost:4000/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
            });
            const result = await response.json();
            this.roles = result.data.roles;
        },
        cancelClicked() {
            this.resetUpsertForm();
            this.activeSection = 'search';
        },
        async saveClicked() {
            const inputElements = this.$refs.divRoles.querySelectorAll('input[type="checkbox"]');
            let selectedRoles = [];

            inputElements.forEach(function (inputElement) {
                if (inputElement.checked) {
                    selectedRoles.push(inputElement.value);
                }
            });

            this.validateInputs(selectedRoles);

            // If there are errors, do not proceed with saving
            if (this.saveErrors) return;

            if (this.heroId) {
                await this.updateHero();

                if (this.rolesChanged(selectedRoles)) {
                    await this.deleteHeroRoles();
                    await this.addHeroRoles(this.heroId, selectedRoles);
                }
            }
            else {
                const newHeroId = await this.createHero();
                await this.addHeroRoles(newHeroId, selectedRoles);
            }

            this.saveSuccessMsg = this.heroId ?
                `"${this.nameModel.trim()}" was updated successfully.` :
                `"${this.nameModel.trim()}" was added successfully.`;

            this.resetUpsertForm();
            this.loadHeroes();
            this.activeSection = 'search';
        },
        rolesChanged(selectedRoles) {
            // Find the current hero object
            const currentHero = this.heroes.find(h => h._id === this.heroId);
            // Get the current role IDs as strings
            const currentRoleIds = currentHero
                ? currentHero.hero_roles.map(hr => hr.role && hr.role._id ? hr.role._id : hr.role_id).map(String).sort()
                : [];

            // Sort selectedRoles for comparison
            const selectedSorted = [...selectedRoles].map(String).sort();

            const rolesChanged = currentRoleIds.length !== selectedSorted.length ||
                !currentRoleIds.every((val, idx) => val === selectedSorted[idx]);

            return rolesChanged;
        },
        validateInputs(selectedRoles) {
            this.saveErrors = "";

            if (this.nameModel === "") {
                this.saveErrors = "Name is required.<br>";
            }
            else {
                const duplicateHero = this.heroes.filter(hero => hero.name.toLowerCase() === this.nameModel.trim().toLowerCase() && hero._id !== this.heroId);

                if (duplicateHero.length > 0) {
                    this.saveErrors = "Hero with this name already exists.<br>";
                }
            }

            if (selectedRoles.length === 0) {
                this.saveErrors += "At least one role must be selected.<br>";
            }
        },
        async updateHero() {
            const query = `
                mutation UpdateHero($edits: AddHeroInput!, $_id: ID!) {
                    updateHero(edits: $edits, _id: $_id) {
                        _id
                    }
                }
            `;

            const variables = {
                edits: {
                    name: this.nameModel.trim(),
                    image_url: this.logoImageModel.trim(),
                    description: this.descriptionModel.trim()
                },
                _id: this.heroId
            };

            const response = await fetch('http://localhost:4000/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, variables })
            });
            const result = await response.json();
        },
        async deleteHeroRoles() {
            const query = `
                mutation DeleteHeroRoles($hero_id: ID!) {
                    deleteHeroRoles(hero_id: $hero_id) {
                        _id
                    }
                }
            `;

            const variables = { hero_id: this.heroId };

            const response = await fetch('http://localhost:4000/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, variables })
            });
        },
        async addHeroRoles(heroId, selectedRoles) {
            const query = `
                mutation AddHeroRole($heroRole: AddHeroRoleInput!) {
                    addHeroRole(heroRole: $heroRole) {
                        _id
                        hero_id
                        role_id
                    }
                }
            `;

            const variables = {
                heroRole: {
                    hero_id: heroId,
                    role_id: selectedRoles
                }
            };

            const response = await fetch('http://localhost:4000/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, variables })
            });
            const result = await response.json();
        },
        async createHero() {
            const query = `
                mutation CreateHero($hero: AddHeroInput!) {
                    addHero(hero: $hero) {
                        _id
                        name
                        image_url
                        description
                    }
                }
            `;

            const variables = {
                hero: {
                    name: this.nameModel.trim(),
                    image_url: this.logoImageModel.trim(),
                    description: this.descriptionModel.trim()
                }
            };

            const response = await fetch('http://localhost:4000/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, variables })
            });
            const result = await response.json();

            return result.data.addHero._id;
        },
        async deleteClicked(heroID, heroName) {
            this.resetSearchMessages();

            const deleteHeroOperation = `
                mutation DeleteHero($_id: ID!) {
                    deleteHero(_id: $_id) {
                        _id
                    }
                }
            `;

            const deleteHeroVariables = { _id: heroID };

            const response = await fetch('http://localhost:4000/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: deleteHeroOperation, variables: deleteHeroVariables })
            });

            const deleteHeroRolesOperation = `
                mutation DeleteHeroRoles($hero_id: ID!) {
                    deleteHeroRoles(hero_id: $hero_id) {
                        _id
                    }
                }
            `;

            const deleteHeroRolesVariables = { hero_id: heroID };

            const responseHeroRole = await fetch('http://localhost:4000/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: deleteHeroRolesOperation, variables: deleteHeroRolesVariables })
            });

            this.deleteSuccessMsg = `"${heroName.trim()}" was deleted successfully.`;
            this.loadHeroes();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        updateClicked(id, name, logoImage, description, roles) {
            this.resetSearchMessages();

            this.heroId = id;
            this.nameModel = name;
            this.logoImageModel = logoImage;
            this.descriptionModel = description;

            const inputElements = this.$refs.divRoles.querySelectorAll('input[type="checkbox"]');

            inputElements.forEach(function (inputElement) {
                const roleToFind = inputElement.id.replace("chk", "").toLowerCase().trim();

                // Check if any role in the array matches roleToFind
                const found = roles.some(r => r.role && r.role.role && r.role.role.toLowerCase().trim() === roleToFind);

                inputElement.checked = found;
            });

            this.activeSection = 'upsert';
        },
        resetUpsertForm() {
            this.heroId = null;
            this.nameModel = "";
            this.logoImageModel = "";

            const inputElements = this.$refs.divRoles.querySelectorAll('input[type="checkbox"]');
            inputElements.forEach(function (inputElement) {
                inputElement.checked = false;
            });

            this.descriptionModel = "";

            this.saveErrors = "";
        },
        addClicked() {
            this.resetSearchMessages();
            this.activeSection = 'upsert';
        },
        resetSearchMessages() {
            this.saveSuccessMsg = "";
            this.deleteSuccessMsg = "";
        }
    },
};
</script>
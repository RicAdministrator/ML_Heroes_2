<template>
    <div v-show="activeSection === 'search'">
        <a class="link-style" @click="addClicked">Add Role</a>
        <div class="w3-panel w3-pale-green w3-border" v-show="saveSuccessMsg || deleteSuccessMsg">
            <h3>Success!</h3>
            <p>{{ saveSuccessMsg ? saveSuccessMsg : deleteSuccessMsg }}</p>
        </div>
        <table style="margin-top: 5px;">
            <thead>
                <tr style="background-color: #2196f3;">
                    <th>Logo</th>
                    <th>Role</th>
                    <th>Primary Function</th>
                    <th>Key Attributes</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="role in roles" :key="role.id">
                    <td>
                        <img v-bind:src="role.logo_url" alt="Avatar" style="height:75px;" />
                    </td>
                    <td>{{ role.role }}</td>
                    <td>{{ role.primary_function }}</td>
                    <td>{{ role.key_attributes }}</td>
                    <td>
                        <button class="w3-btn w3-blue"
                            @click="updateClicked(role._id, role.role, role.logo_url, role.primary_function, role.key_attributes)">Update</button>
                        &nbsp;
                        <button class="w3-btn w3-blue" @click="deleteClicked(role._id)">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <div v-show="activeSection === 'upsert'">
        <div class="w3-panel w3-pale-red w3-border" v-show="saveErrors">
            <h3>Please correct the following errors:</h3>
            <p>{{ saveErrors }}</p>
        </div>
        <div class="w3-card-4">
            <div class="w3-container w3-black" style="margin-bottom: 5px;">
                <h2>{{ roleId ? 'Update Role' : 'Add Role' }}</h2>
            </div>
            <form class="w3-container">
                <div style="margin-bottom: 20px;">
                    <label for="txtRole">Role</label>
                    <input id="txtRole" class="w3-input w3-border" type="text" maxlength="50" v-model="roleModel">
                </div>
                <div style="margin-bottom: 20px;">
                    <label for="txtLogoURL">Logo URL</label>
                    <input id="txtLogoURL" class="w3-input w3-border" type="text" maxlength="150"
                        v-model="logoUrlModel">
                </div>
                <div style="margin-bottom: 20px;">
                    <label for="txtPrimaryFunction">Primary Function</label>
                    <input id="txtPrimaryFunction" class="w3-input w3-border" type="text" maxlength="150"
                        v-model="primaryFunctionModel">
                </div>
                <div style="margin-bottom: 20px;">
                    <label for="txtKeyAttributes">Key Attributes</label>
                    <input id="txtKeyAttributes" class="w3-input w3-border" type="text" maxlength="150"
                        v-model="keyAttributesModel">
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
            roles: [],
            activeSection: "search",

            roleModel: "",
            logoUrlModel: "",
            primaryFunctionModel: "",
            keyAttributesModel: "",

            roleId: null,

            saveErrors: "",
            saveSuccessMsg: "",
            deleteErrorMsg: "",
            deleteSuccessMsg: "",
        };
    },
    mounted() {
        this.loadRoles();
    },
    methods: {
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
        addClicked() {
            this.resetSearchMessages();
            this.activeSection = 'upsert';
        },
        resetUpsertForm() {
            this.roleId = null;
            this.roleModel = "";
            this.logoUrlModel = "";
            this.primaryFunctionModel = "";
            this.keyAttributesModel = "";

            this.saveErrors = "";
        },
        cancelClicked() {
            this.resetUpsertForm();
            this.activeSection = 'search';
        },
        async saveClicked() {
            if (this.roleModel === "") {
                this.saveErrors = "Role is required.";
                return;
            }

            this.loadRoles();
            const duplicateRole = this.roles.filter(role => role.role.toLowerCase() === this.roleModel.trim().toLowerCase() && role.id !== this.roleId);
            if (duplicateRole.length > 0) {
                this.saveErrors = "Role already exists.";
                return;
            }

            let query = "";
            let variables = {};

            if (this.roleId) {
                query = `
                mutation UpdateRole($edits: AddRoleInput!, $_id: ID!) {
                    updateRole(edits: $edits, _id: $_id) {
                        _id
                    }
                }
                `;

                variables = {
                    edits: {
                        role: this.roleModel.trim(),
                        logo_url: this.logoUrlModel.trim(),
                        primary_function: this.primaryFunctionModel.trim(),
                        key_attributes: this.keyAttributesModel.trim()
                    },
                    _id: this.roleId
                };
            }
            else {
                query = `
                mutation AddRole($role: AddRoleInput!) {
                    addRole(role: $role) {
                    role
                    logo_url
                    primary_function
                    key_attributes
                    }
                }
                `;

                variables = {
                    role: {
                        role: this.roleModel.trim(),
                        logo_url: this.logoUrlModel.trim(),
                        primary_function: this.primaryFunctionModel.trim(),
                        key_attributes: this.keyAttributesModel.trim()
                    }
                };
            }

            const response = await fetch('http://localhost:4000/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, variables })
            });
            const result = await response.json();

            this.saveSuccessMsg = this.roleId ? `"${this.roleModel.trim()}" was updated successfully.` : `"${this.roleModel.trim()}" was added successfully.`;
            this.resetUpsertForm();
            this.loadRoles();
            this.activeSection = 'search';
        },
        resetSearchMessages() {
            this.saveSuccessMsg = "";
            this.deleteErrorMsg = "";
            this.deleteSuccessMsg = "";
        },
        async deleteClicked(_id) {
            this.resetSearchMessages();

            // try {
            //     const response = await fetch('http://localhost:3001/api/hero_roles');
            //     if (!response.ok) {
            //         throw new Error(`HTTP error! Status: ${response.status}`);
            //     }

            //     const heroRoles = await response.json();
            //     const heroesWithSpecificRole = heroRoles.filter(heroRole => heroRole.role_id === id);

            //     if (heroesWithSpecificRole.length > 0) {
            //         this.deleteErrorMsg = "This role is assigned to one or more heroes. Please remove the role from the heroes before deleting it.";
            //         return;
            //     }
            // } catch (error) {
            //     console.log(error.message);
            // }

            // try {
            //     const response = await fetch(`http://localhost:3001/api/roles/${id}`, {
            //         method: 'DELETE',
            //     });
            //     if (response.ok) {
            //         console.log('Item deleted successfully');
            //         this.deleteSuccessMsg = "Role was deleted successfully.";
            //         this.loadRoles();
            //     } else {
            //         console.error('Error deleting item:', response.statusText);
            //     }
            // } catch (error) {
            //     console.error('Error deleting item:', error);
            // }

            const query = `
                mutation DeleteRole($_id: ID!) {
                    deleteRole(_id: $_id) {
                        _id
                    }
                }
            `;
            const variables = { _id };
            const response = await fetch('http://localhost:4000/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, variables })
            });

            this.deleteSuccessMsg = "Role was deleted successfully.";
            this.loadRoles();
        },
        updateClicked(_id, role, logoUrl, primaryFunction, keyAttributes) {
            this.resetSearchMessages();

            this.roleId = _id;
            this.roleModel = role;
            this.logoUrlModel = logoUrl;
            this.primaryFunctionModel = primaryFunction;
            this.keyAttributesModel = keyAttributes;

            this.activeSection = 'upsert';
        },
    },
};
</script>
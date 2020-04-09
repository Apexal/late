<!--Tools: Quick links page-->
<template>
  <section class="section quick-links">
    <b-loading
      :is-full-page="false"
      :active="loading"
      :can-cancel="false"
    />

    <h1 class="title has-text-centered-mobile">
      Quick Links
    </h1>
    <h2 class="subtitle has-text-centered-mobile">
      A user-curated list of useful educational links. Can't find what you're
      looking for? Add your own!
    </h2>

    <p
      v-if="quickLinks.length === 0"
      class="has-text-centered has-text-grey"
    >
      Nobody has submitted links yet!
    </p>

    <div
      v-else
      class="columns is-multiline links"
    >
      <div
        v-for="(links, category) in categories"
        :key="category"
        class="column is-one-third-desktop is-full"
      >
        <div class="box category">
          <h2 class="subtitle has-text-grey has-text-centered link-category-title">
            {{ category }}
          </h2>
          <ul>
            <li
              v-for="(link, index) in links"
              :key="index"
              class="link content"
            >
              <img
                class="link-favicon"
                :src="
                  'https://www.google.com/s2/favicons?domain_url=' + link.url
                "
                alt="Favicon"
              >
              <a
                class="has-text-dark link-title"
                target="_blank"
                :href="link.url"
              >
                <b>{{ link.title }}</b>
              </a>
              <span
                v-if="user.admin"
                class="delete is-pulled-right"
                :title="`Delete ${link.title}`"
                @click="deleteQuickLink(link._id)"
              />
              <blockquote
                v-if="link.description"
                class="blockquote link-description"
              >
                {{ link.description }}
              </blockquote>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div v-if="user.admin">
      <hr>
      <h2 class="subtitle">
        Unconfirmed Links
      </h2>
      <div class="overflow">
        <table class="table is-fullwidth">
          <thead>
            <tr>
              <th>Submitter</th>
              <th>Category</th>
              <th>Title</th>
              <th>Description</th>
              <th>URL</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="link in unconfirmedQuickLinks"
              :key="link._id"
            >
              <td>
                <span v-if="link._student">
                  <b>{{ link._student.rcs_id }}</b>
                </span>
                <span
                  v-else
                  class="has-text-grey"
                >—</span>
              </td>
              <td>{{ link.category }}</td>
              <td>{{ link.title }}</td>
              <td>
                <span v-if="link.description">{{ link.description }}</span>
                <span
                  v-else
                  class="has-text-grey"
                >—</span>
              </td>
              <td>{{ link.url }}</td>
              <td>
                <b-button
                  type="is-success"
                  @click="confirmQuickLink(link._id)"
                >
                  <i class="fas fa-check" />
                </b-button>
                <b-button
                  type="is-danger"
                  @click="deleteQuickLink(link._id)"
                >
                  <i class="fas fa-times" />
                </b-button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p
        v-if="unconfirmedQuickLinks.length === 0"
        class="has-text-grey has-text-centered"
      >
        No pending submissions!
      </p>
      <hr>
    </div>

    <form @submit.prevent="submitLink">
      <b-field class="submit-link-field">
        <b-select
          v-model="newLink.category"
          placeholder="Category"
        >
          <option value="school">
            School
          </option>
          <option value="communication">
            Communcation
          </option>
          <option value="entertainment">
            Entertainment
          </option>
          <option value="other">
            Other
          </option>
        </b-select>
        <b-input
          v-if="newLink.category === 'other'"
          v-model="otherCategory"
          type="text"
          placeholder="Custom Category"
          required
        />
        <b-input
          v-model="newLink.title"
          type="text"
          placeholder="Link Title"
          required
        />
        <b-input
          v-model="newLink.description"
          expanded
          type="text"
          placeholder="Description (optional)"
        />
        <b-input
          v-model="newLink.url"
          type="text"
          placeholder="URL"
          required
        />
        <p class="control">
          <button class="button is-primary">
            {{ user.admin ? "Suggest" : "Submit" }} Link
          </button>
        </p>
      </b-field>
    </form>
    <hr>
    <div class="buttons">
      <router-link
        class="button is-link"
        :to="{name: 'tools'}"
      >
        <i class="fas fa-angle-left" />
        All Tools
      </router-link>
    </div>
  </section>
</template>

<script>
export default {
  name: 'QuickLinks',
  data () {
    return {
      loading: true,
      otherCategory: '',
      newLink: {
        category: 'school',
        title: '',
        description: '',
        url: ''
      },
      quickLinks: []
    }
  },
  computed: {
    confirmedQuickLinks () {
      return this.quickLinks.filter(link => link.confirmed)
    },
    unconfirmedQuickLinks () {
      return this.quickLinks.filter(link => !link.confirmed)
    },
    categories () {
      const categories = {}
      for (const link of this.confirmedQuickLinks) {
        categories[link.category] = categories[link.category] || []
        categories[link.category].push(link)
      }

      return categories
    }
  },
  mounted () {
    this.getQuickLinks()
  },
  methods: {
    async deleteQuickLink (quickLinkID) {
      this.loading = true

      let response
      try {
        response = await this.$http.delete('/quicklinks/' + quickLinkID)
      } catch (e) {
        this.loading = false
        return this.showError(e.response.data.message)
      }

      this.quickLinks = this.quickLinks.filter(
        quickLink => quickLink._id !== response.data.deletedQuickLink._id
      )

      this.$buefy.toast.open({
        message: 'Deleted submitted quick link!',
        type: 'is-success'
      })

      this.loading = false
    },
    async confirmQuickLink (quickLinkID) {
      this.loading = true

      let response
      try {
        response = await this.$http.patch('/quicklinks/' + quickLinkID, {
          confirmed: true
        })
      } catch (e) {
        this.loading = false
        return this.showError(e.response.data.message)
      }

      Object.assign(
        this.quickLinks.find(
          link => link._id === response.data.updatedQuickLink._id
        ),
        response.data.updatedQuickLink
      )

      this.$buefy.toast.open({
        message: 'Confirmed submitted quick link!',
        type: 'is-success'
      })

      this.loading = false
    },
    async submitLink () {
      this.loading = true

      // concatonates an https://www. if one is not present
      if (!this.newLink.url.includes('http')) {
        this.newLink.url = 'https://www.'.concat(this.newLink.url)
      }

      let request
      try {
        request = await this.$http.post('/quicklinks', { ...this.newLink, category: this.newLink.category === 'other' ? this.otherCategory : this.newLink.category })
      } catch (e) {
        this.loading = false
        return this.showError(e.response.data.message)
      }

      if (request.data.createdQuickLink.confirmed) {
        this.quickLinks.push(request.data.createdQuickLink)
      }

      this.$buefy.toast.open({
        message:
          'Submitted link! It will be reviewed by an admin before being added.',
        type: 'is-warning',
        duration: 5000
      })

      this.newLink = {
        title: '',
        description: '',
        url: ''
      }

      this.loading = false
    },
    async getQuickLinks () {
      this.loading = true

      let request

      try {
        request = await this.$http.get('/quicklinks')
      } catch (e) {
        this.loading = false
        return this.showError(e.response.data.message)
      }

      this.quickLinks = request.data.quickLinks

      this.loading = false
    }
  }
}
</script>

<style lang="scss" scoped>
.button i.fas {
  margin-right: 3px;
}

.category {
  .link-category-title {
    margin-bottom: 10px;
    text-transform: capitalize;
  }
  .link {
    margin-bottom: 10px;
    .link-favicon {
      height: 16px;
      width: 16px;
      margin-right: 5px;
    }
    .link-description {
      padding: 5px;
    }

    .delete {
      opacity: 0;
      transition: opacity 0.2s;
    }

    &:hover {
      .delete {
        opacity: 1;
      }
    }
  }
}

@media only screen and (max-width: 768px) {
  .submit-link-field {
    flex-direction: column;
  }
}

.overflow {
  overflow: auto;
}
</style>

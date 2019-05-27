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
        class="column is-one-third"
      >
        <div class="box category">
          <h2
            class="subtitle has-text-grey has-text-centered link-category-title"
          >
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
    <hr>
    <form @submit.prevent="submitLink">
      <b-field>
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
        </b-select>
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
          type="url"
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
  </section>
</template>

<script>
export default {
  name: 'QuickLinks',
  data () {
    return {
      loading: true,
      newLink: {
        category: 'school',
        title: '',
        description: '',
        url: ''
      },
      quickLinks: []
    };
  },
  computed: {
    categories () {
      const categories = {};
      for (const link of this.quickLinks) {
        categories[link.category] = categories[link.category] || [];
        categories[link.category].push(link);
      }

      return categories;
    }
  },
  mounted () {
    this.getQuickLinks();
  },
  methods: {
    async submitLink () {
      this.loading = true;

      let request;
      try {
        request = await this.$http.post('/quicklinks', this.newLink);
      } catch (e) {
        this.$toast.open({
          message: e.response.data.message,
          type: 'is-danger'
        });
        this.loading = false;
        return;
      }

      this.$toast.open({
        message:
          'Submitted link! It will be reviewed by an admin before being added.',
        type: 'is-warning',
        duration: 5000
      });

      this.newLink = {
        title: '',
        description: '',
        url: ''
      };

      this.loading = false;
    },
    async getQuickLinks () {
      this.loading = true;

      let request;

      try {
        request = await this.$http.get('/quicklinks');
      } catch (e) {
        this.$toast.open({
          message: e.response.data.message,
          type: 'is-danger'
        });
        this.loading = false;
        return;
      }

      this.quickLinks = request.data.quickLinks;

      this.loading = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.title {
  padding-bottom: 0px;
  padding-left: 0px;
  border-bottom-color: #dbdbdb;
  border-bottom-style: solid;
  border-bottom-width: 1px;
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
  }
}
</style>
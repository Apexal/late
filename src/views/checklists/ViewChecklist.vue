<template>
  <section class="section view-move-in-checklist">
    <b-loading
      :is-full-page="false"
      :active="loading"
      :can-cancel="false"
    />

    <h1 class="title has-text-centered-mobile">
      <span :title="checklist._student.rcs_id">{{ owner }}</span>'s Dorm Move In Checklist
    </h1>

    <div
      class="columns is-desktop is-multiline categories"
    >
      <div
        v-for="(category, index) in checklist.categories"
        :key="index"
        class="column is-one-third-fullhd is-half-desktop is-full category-column"
      >
        <Category
          :category-index="index"
          :category="category"
          :editing="false"
          :viewing="true"
        />
      </div>
    </div>

    <hr>

    <div class="buttons">
      <router-link
        class="button is-link"
        :to="{ name: 'tools' }"
      >
        <i class="fas fa-angle-left" />
        All Tools
      </router-link>
    </div>
  </section>
</template>

<script>
import MoveInChecklistCategory from '@/views/checklists/components/MoveInChecklistCategory';

export default {
  name: 'ViewChecklist',
  components: { Category: MoveInChecklistCategory },
  data () {
    return {
      loading: true,
      checklist: {}
    };
  },
  computed: {
    checklistID () {
      return this.$route.params.checklistID;
    },
    owner () {
      if (!this.checklist._student) return null;
      return this.checklist._student.display_name;
    }
  },
  created () {
    this.getChecklist();
  },
  methods: {
    async getChecklist () {
      // Get checklist
      this.loading = true;
      let response;
      try {
        response = await this.$http.get('/checklists/' + this.checklistID);
      } catch (e) {
        this.$toast.open({
          message:
            e.response.data.message,
          type: 'is-danger'
        });
        this.$router.push({ name: 'tools' });
        return;
      }

      // if (response.data.checklist._student.rcs_id === this.user.rcs_id) return this.$router.push({ name: 'checklist' });


      this.checklist = response.data.checklist;
      this.loading = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.button i.fas {
  margin-right: 3px;
}
</style>

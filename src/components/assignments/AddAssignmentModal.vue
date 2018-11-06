<template>
  <div>
    <button
      class="button is-success"
      @click="open=!open">Add Assignment</button>
    <div
      :class="{'is-active': open}"
      class="add-assignment-modal modal">
      <div class="modal-background"/>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Add Assignment</p>
        </header>

        <section class="modal-card-body">
          <form
            id="add-assignment-form"
            class="form"
            @submit.prevent="save">
            <div class="columns is-multiline">
              <div class="column is-half">
                <div class="field">
                  <label
                    for="course-id"
                    class="label">Course</label>
                  <div class="control">
                    <select
                      id="course-id"
                      v-model="course_crn"
                      name="course_crn"
                      class="input"
                      required>
                      <option
                        v-for="c in courses"
                        :key="c.listing_id"
                        :value="c.crn">{{ c.longname }}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="column is-half">
                <div class="field">
                  <label
                    for="title"
                    class="label">Title</label>
                  <div class="control">
                    <input
                      id="title"
                      v-model="title"
                      name="title"
                      type="text"
                      class="input"
                      maxlength="200"
                      required>
                  </div>
                </div>
              </div>
            </div>
          </form>


        </section>

        <footer class="modal-card-foot">
          <button
            class="button is-warning"
            @click="open=false">Cancel</button>
          <button
            form="add-assignment-form"
            class="button is-success">Save</button>
        </footer>
      </div>
    </div>
  </div>

</template>

<script>
import API from '../../api';

export default {
  name: 'AddAssignmentModal',
  data() {
    return {
      open: false,
      course_crn: '',
      title: '',
      description: 'from VueJS',
      due_date: new Date(),
      time: 'class',
      time_estimate: 1,
      priority: 5
    };
  },
  computed: {
    courses() {
      return this.$store.state.auth.user.current_schedule;
    }
  },
  methods: {
    async save() {
      const request = await API.post('/assignments/create', {
        title: this.title,
        description: this.description,
        due_date: this.due_date,
        course_crn: this.course_crn,
        time_estimate: this.time_estimate,
        priority: this.priority
      });

      await this.$store.dispatch(
        'ADD_ASSIGNMENT',
        request.data.createdAssignment
      );
      this.title = '';
      this.description = '';
    }
  }
};
</script>

<style lang="scss" scoped>
</style>

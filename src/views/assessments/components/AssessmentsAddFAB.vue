<!--Dashboard: Add assessment FAB-->
<template>
  <div class="fab is-hidden-widescreen">
    <span class="fab-action-button">
      <i class="fas fa-plus" />
    </span>
    <ul class="fab-buttons">
      <li class="fab-buttons__item">
        <a
          class="fab-buttons__link option has-text-dark"
          title="Add assignment"
          @click="$store.commit('TOGGLE_ADD_ASSIGNMENT_MODAL')"
        >
          <i class="fas fa-clipboard-check" />
        </a>
      </li>

      <li class="fab-buttons__item">
        <a
          class="fab-buttons__link option has-text-dark"
          title="Add exam"
          @click="$store.commit('TOGGLE_ADD_EXAM_MODAL')"
        >
          <i class="fas fa-exclamation-triangle" />
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'AssessmentsAddFAB'
}
</script>

<style scoped lang="scss">
//Thanks to ruslan_khomiak and Cole Waldrip on CodePen
.fab {
  position: fixed;
  width: 56px;
  right: 28px;
  bottom: 15px;
  margin-left: -28px;
  z-index: 100000000; //God I hope this is as high as we go
}

.fab:hover .fab-buttons {
  opacity: 1;
  visibility: visible;
}

.fab:hover .fab-buttons__link {
  transform: scaleY(1) scaleX(1) translateY(-16px) translateX(0px);
}
.fab-action-button:hover + .fab-buttons .fab-buttons__link:before {
  visibility: visible;
  opacity: 1;
  transform: scale(1);
  transform-origin: right center 0;
  transition-delay: 0.3s;
}

.fab-action-button {
  position: absolute;
  bottom: 0;
  display: block;
  width: 56px;
  height: 56px;
  background-color: #29b6f6;
  border-radius: 50%;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12),
    0 3px 1px -2px rgba(0, 0, 0, 0.2);
  i {
    width: 100%;
    text-align: center;
    line-height: 56px;
    vertical-align: middle;
    transition: 0.1s;
    transition-timing-function: ease-in-out;
    color: white;
  }
}

//Spin effect
.fab-action-button:hover i {
  -webkit-transform: rotate(45deg);
  -moz-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  -o-transform: rotate(45deg);
  transform: rotate(45deg);
  cursor: pointer;
  transition: 0.1s;
  transition-timing-function: ease-out;
}

.fab-buttons {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 50px;
  list-style: none;
  margin: 0;
  padding: 0;
  opacity: 0;
  visibility: hidden;
  transition: 0.2s;
}

.fab-buttons__item {
  display: block;
  text-align: center;
  margin: 12px 0;
}

.fab-buttons__link {
  display: inline-block;
  width: 40px;
  height: 40px;
  text-decoration: none;
  background-color: #ffffff;
  border-radius: 50%;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12),
    0 3px 1px -2px rgba(0, 0, 0, 0.2);
  transform: scaleY(0.5) scaleX(0.5) translateY(10px) translateX(0px);
  -moz-transition: 0.3s;
  -webkit-transition: 0.3s;
  -o-transition: 0.3s;
  transition: 0.3s;

  i {
    width: 100%;
    text-align: center;
    line-height: 40px;
    vertical-align: middle;
    transition: 0.2s;
  }

  //Icon scale effect
  i:hover {
    transform: scale(1.2);
    transition: 0.05s;
    transition-timing-function: ease-out;
  }
}

[data-tooltip]:before {
  top: 50%;
  margin-top: -11px;
  font-weight: 600;
  border-radius: 2px;
  background: #585858;
  color: #fff;
  content: attr(data-tooltip);
  font-size: 12px;
  text-decoration: none;
  visibility: hidden;
  opacity: 0;
  padding: 4px 7px;
  margin-right: 12px;
  position: absolute;
  transform: scale(0);
  right: 100%;
  white-space: nowrap;
  transform-origin: top right;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

[data-tooltip]:hover:before {
  visibility: visible;
  opacity: 1;
  transform: scale(1);
  transform-origin: right center 0;
}

.icon-material {
  display: inline-block;
  width: 40px;
  height: 40px;
}
</style>

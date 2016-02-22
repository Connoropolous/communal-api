var listModelQuerySettings = (qb, table, column, opts) => {
  qb.limit(opts.limit || 20)

  // this will require the fetch or fetchAll call to have {columns: [column]}
  qb.groupBy(column)

  if (opts.autocomplete) {
    Search.addTermToQueryBuilder(opts.autocomplete, qb, {
      columns: [format('%s.%s', table, column)]
    })
    // qb.whereRaw('users_org.org_name ilike ?', opts.autocomplete + '%')
  }

  qb.whereRaw(format('length(%s) < 40', column))
}

module.exports = {
  forUsers: function (opts) {
    return User.query(function (qb) {
      qb.limit(opts.limit || 1000)
      qb.offset(opts.offset || 0)
      qb.where('users.active', '=', true)

      // this is not necessarily what any consumer desires, but
      // some ordering must be specified for pagination
      qb.orderBy('name', 'asc')

      // this counts total rows matching the criteria, disregarding limit,
      // which is useful for pagination
      qb.select(bookshelf.knex.raw('count(users.*) over () as total'))

      if (opts.communities && opts.project) {
        qb.leftJoin('users_community', 'users_community.user_id', '=', 'users.id')
        qb.leftJoin('projects_users', 'projects_users.user_id', '=', 'users.id')
        qb.leftJoin('projects', 'projects.user_id', '=', 'users.id')

        qb.where(function () {
          this.where(function () {
            this.whereIn('users_community.community_id', opts.communities)
            this.where('users_community.active', true)
          })
          .orWhere(function () {
            this.where('projects.id', opts.project)
            .orWhere('projects_users.project_id', opts.project)
          })
        })
      } else if (opts.communities) {
        qb.join('users_community', 'users_community.user_id', '=', 'users.id')
        qb.whereIn('users_community.community_id', opts.communities)
        qb.where('users_community.active', true)
      } else if (opts.project) {
        qb.join('projects_users', 'projects_users.user_id', '=', 'users.id')
        qb.leftJoin('projects', 'projects.user_id', '=', 'users.id')
        qb.where(function () {
          this.where('projects.id', opts.project)
          .orWhere('projects_users.project_id', opts.project)
        })
      }

      if (opts.autocomplete) {
        qb.whereRaw('users.name ilike ?', opts.autocomplete + '%')
      }

      if (opts.term) {
        qb.leftJoin('users_skill', 'users_skill.user_id', '=', 'users.id')
        qb.leftJoin('users_org', 'users_org.user_id', '=', 'users.id')
        Search.addTermToQueryBuilder(opts.term, qb, {
          columns: ['users.name', 'users.bio', 'users_skill.skill_name', 'users_org.org_name']
        })
      }

      // prevent duplicates due to the joins
      qb.groupBy('users.id')

      if (opts.start_time && opts.end_time) {
        qb.whereRaw('users.created_at between ? and ?', [opts.start_time, opts.end_time])
      }

      if (opts.exclude) {
        qb.whereNotIn('id', opts.exclude)
      }
    })
  },

  forSkills: function (opts) {
    return Skill.query(qb => {
      listModelQuerySettings(qb, 'users_skill', 'skill_name', opts)
    })
  },

  forTools: function (opts) {
    return UseOfTool.query(qb => {
      qb.where('tool_community.community_id', '=', opts.community_id)
    })
  },

  forOrganizations: function (opts) {
    return Organization.query(qb => {
      listModelQuerySettings(qb, 'users_org', 'org_name', opts)
    })
  },

  addTermToQueryBuilder: function (term, qb, opts) {
    var query = _.chain(term.split(/\s*\s/)) // split on whitespace
    .map(word => word.replace(/[,;|:&()!\\]+/, ''))
    .reject(_.isEmpty)
    .map(word => word + ':*') // add prefix matching
    .reduce((result, word) => {
      // build the tsquery string using logical AND operands
      result += ' & ' + word
      return result
    }).value()

    var statement = format('(%s)',
      opts.columns
      .map(col => format("(to_tsvector('english', %s) @@ to_tsquery(?))", col))
      .join(' or '))

    var values = _.times(opts.columns.length, () => query)

    qb.where(function () {
      this.whereRaw(statement, values)
    })
  }

}
